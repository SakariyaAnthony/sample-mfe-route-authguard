const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');

const PORT = Number(process.env.PORT) || 4000;
const DELAY_MS = Number(process.env.API_DELAY_MS ?? 600);
const TOKEN_TTL_MS = Number(process.env.TOKEN_TTL_MS) || 15 * 60 * 1000;

// Loaded into memory so every restart starts from the seed data.
const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8'));

const server = jsonServer.create();
const router = jsonServer.router(seed);
const db = router.db;

// Which permission a user needs to touch each resource. The UI guards are
// only a convenience; the API is the real enforcement point.
const RESOURCE_PERMISSION = {
  accounts: 'accounts',
  transactions: 'accounts',
  cards: 'cards',
  billers: 'utility',
  payments: 'utility',
  transfers: 'transfer',
  beneficiaries: 'beneficiary',
};

const createToken = (user) =>
  Buffer.from(JSON.stringify({ sub: user.id, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');

const readToken = (header = '') => {
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return db.get('users').find({ id: payload.sub }).value() || null;
  } catch {
    return null;
  }
};

const publicUser = ({ password, ...user }) => user;

const debit = (accountId, amount, description) => {
  const account = db.get('accounts').find({ id: Number(accountId) }).value();
  if (!account) return { status: 404, message: 'Source account not found' };
  if (account.balance < amount) return { status: 422, message: 'Insufficient balance in the selected account' };

  db.get('accounts')
    .find({ id: account.id })
    .assign({ balance: Math.round((account.balance - amount) * 100) / 100 })
    .write();
  db.get('transactions')
    .push({
      id: Date.now(),
      accountId: account.id,
      date: new Date().toISOString().slice(0, 10),
      description,
      type: 'DR',
      amount,
    })
    .write();
  return null;
};

const reference = (prefix) => `${prefix}${Date.now().toString().slice(-8)}`;

server.use(jsonServer.defaults({ logger: true }));
server.use(jsonServer.bodyParser);
server.use((req, res, next) => setTimeout(next, DELAY_MS));

server.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.get('users').find({ username, password }).value();
  if (!user) return res.status(401).json({ message: 'Invalid username or password' });
  res.json({ token: createToken(user), expiresIn: TOKEN_TTL_MS, user: publicUser(user) });
});

server.use((req, res, next) => {
  const resource = req.path.split('/')[1];
  if (resource === 'users') return res.status(404).json({ message: 'Not found' });

  const user = readToken(req.headers.authorization);
  if (!user) return res.status(401).json({ message: 'Session expired or invalid token. Please log in again.' });

  const permission = RESOURCE_PERMISSION[resource];
  if (permission && !user.permissions.includes(permission)) {
    return res.status(403).json({ message: `You do not have the "${permission}" permission` });
  }

  req.user = user;
  next();
});

server.post('/transfers', (req, res) => {
  const { fromAccountId, beneficiaryId, amount, remarks = '' } = req.body || {};
  const value = Number(amount);
  if (!fromAccountId || !beneficiaryId || !(value > 0)) {
    return res.status(400).json({ message: 'fromAccountId, beneficiaryId and a positive amount are required' });
  }
  const beneficiary = db.get('beneficiaries').find({ id: Number(beneficiaryId) }).value();
  if (!beneficiary) return res.status(404).json({ message: 'Beneficiary not found' });

  const error = debit(fromAccountId, value, `Transfer to ${beneficiary.name}${remarks ? ` - ${remarks}` : ''}`);
  if (error) return res.status(error.status).json({ message: error.message });

  const transfer = {
    id: Date.now(),
    reference: reference('TRF'),
    fromAccountId: Number(fromAccountId),
    beneficiaryId: beneficiary.id,
    beneficiaryName: beneficiary.name,
    amount: value,
    remarks,
    status: 'SUCCESS',
    createdAt: new Date().toISOString(),
  };
  db.get('transfers').push(transfer).write();
  res.status(201).json(transfer);
});

server.post('/payments', (req, res) => {
  const { billerId, accountId, consumerNumber, amount } = req.body || {};
  const value = Number(amount);
  if (!billerId || !accountId || !consumerNumber || !(value > 0)) {
    return res.status(400).json({ message: 'billerId, accountId, consumerNumber and a positive amount are required' });
  }
  const biller = db.get('billers').find({ id: Number(billerId) }).value();
  if (!biller) return res.status(404).json({ message: 'Biller not found' });

  const error = debit(accountId, value, `Bill payment - ${biller.name}`);
  if (error) return res.status(error.status).json({ message: error.message });

  const payment = {
    id: Date.now(),
    reference: reference('BIL'),
    billerId: biller.id,
    billerName: biller.name,
    accountId: Number(accountId),
    consumerNumber,
    amount: value,
    status: 'SUCCESS',
    createdAt: new Date().toISOString(),
  };
  db.get('payments').push(payment).write();
  res.status(201).json(payment);
});

server.use(router);

server.listen(PORT, () => {
  console.log(`Mock banking API running on http://localhost:${PORT} (delay ${DELAY_MS}ms, token TTL ${TOKEN_TTL_MS / 1000}s)`);
});

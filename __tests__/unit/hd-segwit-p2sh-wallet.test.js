import assert from 'assert';
import { SegwitP2SHWallet, SegwitBech32Wallet, HDSegwitP2SHWallet, LegacyWallet } from '../../';

it('can create a Segwit HD (BIP49)', async function () {
  const mnemonic =
    'honey risk juice trip orient galaxy win situate shoot anchor bounce remind horse traffic exotic since escape mimic ramp skin judge owner topple erode';
  const hd = new HDSegwitP2SHWallet();
  hd.setSecret(mnemonic);
  assert.strictEqual('3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK', hd._getExternalAddressByIndex(0));
  assert.strictEqual('35p5LwCAE7mH2css7onyQ1VuS1jgWtQ4U3', hd._getExternalAddressByIndex(1));
  assert.strictEqual('32yn5CdevZQLk3ckuZuA8fEKBco8mEkLei', hd._getInternalAddressByIndex(0));
  assert.ok(hd.getAllExternalAddresses().includes('3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK'));
  assert.ok(hd.getAllExternalAddresses().includes('35p5LwCAE7mH2css7onyQ1VuS1jgWtQ4U3'));
  assert.ok(!hd.getAllExternalAddresses().includes('32yn5CdevZQLk3ckuZuA8fEKBco8mEkLei')); // not internal
  assert.strictEqual(true, hd.validateMnemonic());

  assert.strictEqual(
    hd._getPubkeyByAddress(hd._getExternalAddressByIndex(0)).toString('hex'),
    '0348192db90b753484601aaf1e6220644ffe37d83a9a5feff32b4da43739f736be',
  );
  assert.strictEqual(
    hd._getPubkeyByAddress(hd._getInternalAddressByIndex(0)).toString('hex'),
    '03c107e6976d59e17490513fbed3fb321736b7231d24f3d09306c72714acf1859d',
  );

  assert.strictEqual(hd._getDerivationPathByAddress(hd._getExternalAddressByIndex(0)), "m/84'/0'/0'/0/0"); // wrong, FIXME
  assert.strictEqual(hd._getDerivationPathByAddress(hd._getInternalAddressByIndex(0)), "m/84'/0'/0'/1/0"); // wrong, FIXME

  assert.strictEqual('L4MqtwJm6hkbACLG4ho5DF8GhcXdLEbbvpJnbzA9abfD6RDpbr2m', hd._getExternalWIFByIndex(0));
  assert.strictEqual(
    'ypub6WhHmKBmHNjcrUVNCa3sXduH9yxutMipDcwiKW31vWjcMbfhQHjXdyx4rqXbEtVgzdbhFJ5mZJWmfWwnP4Vjzx97admTUYKQt6b9D7jjSCp',
    hd.getXpub(),
  );
});

it('can convert witness to address', () => {
  let address = SegwitP2SHWallet.witnessToAddress('035c618df829af694cb99e664ce1b34f80ad2c3b49bcd0d9c0b1836c66b2d25fd8');
  assert.strictEqual(address, '34ZVGb3gT8xMLT6fpqC6dNVqJtJmvdjbD7');

  address = SegwitP2SHWallet.scriptPubKeyToAddress('a914e286d58e53f9247a4710e51232cce0686f16873c87');
  assert.strictEqual(address, '3NLnALo49CFEF4tCRhCvz45ySSfz3UktZC');

  address = SegwitBech32Wallet.witnessToAddress('035c618df829af694cb99e664ce1b34f80ad2c3b49bcd0d9c0b1836c66b2d25fd8');
  assert.strictEqual(address, 'bc1quhnve8q4tk3unhmjts7ymxv8cd6w9xv8wy29uv');

  address = SegwitBech32Wallet.scriptPubKeyToAddress('00144d757460da5fcaf84cc22f3847faaa1078e84f6a');
  assert.strictEqual(address, 'bc1qf46hgcx6tl90snxz9uuy0742zpuwsnm27ysdh7');

  address = LegacyWallet.scriptPubKeyToAddress('76a914d0b77eb1502c81c4093da9aa6eccfdf560cdd6b288ac');
  assert.strictEqual(address, '1L2bNMGRQQLT2AVUek4K9L7sn3SSMioMgE');
});

it('Segwit HD (BIP49) can generate addressess only via ypub', function () {
  const ypub = 'ypub6WhHmKBmHNjcrUVNCa3sXduH9yxutMipDcwiKW31vWjcMbfhQHjXdyx4rqXbEtVgzdbhFJ5mZJWmfWwnP4Vjzx97admTUYKQt6b9D7jjSCp';
  const hd = new HDSegwitP2SHWallet();
  hd._xpub = ypub;
  assert.strictEqual('3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK', hd._getExternalAddressByIndex(0));
  assert.strictEqual('35p5LwCAE7mH2css7onyQ1VuS1jgWtQ4U3', hd._getExternalAddressByIndex(1));
  assert.strictEqual('32yn5CdevZQLk3ckuZuA8fEKBco8mEkLei', hd._getInternalAddressByIndex(0));
  assert.ok(hd.getAllExternalAddresses().includes('3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK'));
  assert.ok(hd.getAllExternalAddresses().includes('35p5LwCAE7mH2css7onyQ1VuS1jgWtQ4U3'));
  assert.ok(!hd.getAllExternalAddresses().includes('32yn5CdevZQLk3ckuZuA8fEKBco8mEkLei')); // not internal
});

it('can generate Segwit HD (BIP49)', async () => {
  const hd = new HDSegwitP2SHWallet();
  const hashmap = {};
  for (let c = 0; c < 1000; c++) {
    await hd.generate();
    const secret = hd.getSecret();
    if (hashmap[secret]) {
      throw new Error('Duplicate secret generated!');
    }
    hashmap[secret] = 1;
    assert.ok(secret.split(' ').length === 12 || secret.split(' ').length === 24);
  }

  const hd2 = new HDSegwitP2SHWallet();
  hd2.setSecret(hd.getSecret());
  assert.ok(hd2.validateMnemonic());
});

it('can work with malformed mnemonic', () => {
  let mnemonic =
    'honey risk juice trip orient galaxy win situate shoot anchor bounce remind horse traffic exotic since escape mimic ramp skin judge owner topple erode';
  let hd = new HDSegwitP2SHWallet();
  hd.setSecret(mnemonic);
  const seed1 = hd.getMnemonicToSeedHex();
  assert.ok(hd.validateMnemonic());

  mnemonic = 'hell';
  hd = new HDSegwitP2SHWallet();
  hd.setSecret(mnemonic);
  assert.ok(!hd.validateMnemonic());

  // now, malformed mnemonic

  mnemonic =
    '    honey  risk   juice    trip     orient      galaxy win !situate ;; shoot   ;;;   anchor Bounce remind\nhorse \n traffic exotic since escape mimic ramp skin judge owner topple erode ';
  hd = new HDSegwitP2SHWallet();
  hd.setSecret(mnemonic);
  const seed2 = hd.getMnemonicToSeedHex();
  assert.strictEqual(seed1, seed2);
  assert.ok(hd.validateMnemonic());
});

it('can consume user generated entropy', async () => {
  const hd = new HDSegwitP2SHWallet();
  const zeroes = [...Array(32)].map(() => 0);
  await hd.generateFromEntropy(Buffer.from(zeroes));
  assert.strictEqual(
    hd.getSecret(),
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art',
  );
});

it('can fullfill user generated entropy if less than 32 bytes provided', async () => {
  const hd = new HDSegwitP2SHWallet();
  const zeroes = [...Array(16)].map(() => 0);
  await hd.generateFromEntropy(Buffer.from(zeroes));
  const secret = hd.getSecret();
  assert.strictEqual(secret.startsWith('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon'), true);

  let secretWithoutChecksum = secret.split(' ');
  secretWithoutChecksum.pop();
  secretWithoutChecksum = secretWithoutChecksum.join(' ');
  assert.strictEqual(
    secretWithoutChecksum.endsWith('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon'),
    false,
  );

  assert.ok(secret.split(' ').length === 12 || secret.split(' ').length === 24);
});

it('signs and verifies messages', async () => {
  const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
  const hd = new HDSegwitP2SHWallet();
  hd.setSecret(mnemonic);
  assert.strictEqual(hd._getExternalAddressByIndex(0), '37VucYSaXLCAsxYyAPfbSi9eh4iEcbShgf');
  assert.strictEqual(
    hd.signMessage('running bitcoin', hd._getExternalAddressByIndex(0), true),
    'H/+rN386XGg2gcekDIzMk1XtvN5iZnAhxfk+Usnlsl55CxGAF/Ci78VRl1ZkG+y6yjbm73JEHUIWq64FsHPbBG4=',
  );
  assert.ok(
    hd.verifyMessage(
      'running bitcoin',
      hd._getExternalAddressByIndex(0),
      'H/+rN386XGg2gcekDIzMk1XtvN5iZnAhxfk+Usnlsl55CxGAF/Ci78VRl1ZkG+y6yjbm73JEHUIWq64FsHPbBG4=',
    ),
  );
});
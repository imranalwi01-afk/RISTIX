import { api } from './packages/frontend/src/services/api/index.ts';

async function run() {
  try {
    const res = await api.banking.businessSetup.getDetails('BLGD01');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();

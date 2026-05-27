import apiService from './services/api';

async function test() {
  try {
    const response = await apiService.getPublicPension(1);
    console.log(JSON.stringify(response.data.policies, null, 2));
  } catch (error) {
    console.error(error);
  }
}

test();

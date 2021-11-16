import { API } from 'aws-amplify';
import { sleep } from './sleep';

export interface JobResponse {
  jobId: string;
  status: string;
  result: string | null;
}

export const pollJob = async (jobId: string, hook: (res: JobResponse) => void): Promise<string | null> => {
  const res: JobResponse = await API.get('api', `/job/${jobId}`, {});

  hook(res);

  switch (res.status) {
    case 'SUCCESS':
      return res.result;
    case 'ERROR':
      console.error(res.result);
      throw new Error();
    default:
      await sleep(1000);
      return await pollJob(jobId, hook);
  }
}

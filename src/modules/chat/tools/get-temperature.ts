import { tool } from 'langchain';
import z from 'zod';

export const getTemperature = tool(
  (input) => `${input.city}의 기온은 20℃ 입니다.`,
  {
    name: 'get_temperature',
    description: '특정 도시의 현재 온도를 반환합니다.',
    schema: z.object({
      city: z.string().describe('도시 이름'),
    }),
  },
);

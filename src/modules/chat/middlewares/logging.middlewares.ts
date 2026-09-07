import { createMiddleware } from 'langchain';

export const createLoggingMiddleware = (maxMessages: number = 50) => {
  return createMiddleware({
    name: 'MessageLimitMiddleware',
    beforeAgent(state, runtime) {
      console.log('🛠️ Agent starting execution.');
    },
    afterAgent(state, runtime) {
      console.log('🛠️ Agent finished execution.');
    },
    beforeModel: {
      canJumpTo: ['end'],
      hook: (state) => {
        console.log(
          `Sending message to model: ${state.messages.map((msg) => msg.content).join(', ')}`,
        );
        return;
      },
    },
    afterModel: (state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      console.log(`Model returned: ${lastMessage.content}`);
      return;
    },
    wrapModelCall: async (request, handler) => {
      const result = await handler(request);
      console.log(`✅ Model call: ${result.content}`);
      return result;
    },
    wrapToolCall: async (request, handler) => {
      console.log(
        `🛠️ Tool call: ${request.toolCall.name} with input`,
        request.toolCall.args,
      );
      const result = await handler(request);
      console.log(`✅ Tool result: `, result);
      return result;
    },
  });
};

import { topicsInit } from '../../src/reducers/topics';
import each from 'jest-each';

const dateRegex = '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d{3}Z$';
// MOCK WEB3
const origWindow = {};
const mockProvider = {
  sendAsync: ({ method }, callback) => {
    if (method === 'eth_accounts') {
      callback(null, { result: ['0xf00'] });
    }
  }
};
window.web3 = {
  currentProvider: mockProvider,
  eth: {
    defaultAccount: '0xf00bae'
  }
};
window.ethereum = {
  enable: async () => {
    window.ethereum['sendAsync'] = mockProvider.sendAsync;
  }
};

test('topicsInit dispatches a TOPICS_FAILURE action when it cannot reach the backend', async () => {
  // SETUP
  const oldFetch = fetch;
  global.fetch = require('jest-fetch-mock');

  const dispatch = jest.fn();
  process.env.REACT_APP_GOV_BACKEND = 'prod';
  fetch.mockResponse('', {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });

  // EXERCISE
  await topicsInit('mainnet')(dispatch);

  // ASSERT
  expect(fetch.mock.calls.length).toBe(5);
  expect(dispatch.mock.calls.length).toBe(3);
  expect(dispatch.mock.calls[0][0]).toEqual({
    type: 'topics/TOPICS_REQUEST',
    payload: {}
  });
  expect(dispatch.mock.calls[1][0]).toEqual({
    type: 'topics/TOPICS_FAILURE',
    payload: { error: expect.any(Error) }
  });

  // TEARDOWN
  global.fetch = oldFetch;
});

each([
  ['mainnet', 'mock'],
  ['kovan', 'mock'],
  ['mainnet', 'prod'],
  ['kovan', 'prod']
]).test(
  'topicsInit dispatches a TOPICS_SUCCESS action when it can reach the backend (%s / %s)',
  async (network, backend) => {
    const dispatch = jest.fn();
    process.env.REACT_APP_GOV_BACKEND = backend;

    await topicsInit(network)(dispatch);

    expect(dispatch.mock.calls.length).toBe(3);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: 'topics/TOPICS_REQUEST',
      payload: {}
    });
    expect(dispatch.mock.calls[1][0]).toEqual({
      type: 'topics/TOPICS_SUCCESS',
      payload: expect.arrayContaining([
        expect.objectContaining({
          topic: expect.any(String),
          key: expect.any(String),
          active: expect.any(Boolean),
          govVote: expect.any(Boolean),
          topic_blurb: expect.any(String),
          end_timestamp: expect.any(Number),
          date: expect.stringMatching(dateRegex),
          verified: expect.any(Boolean),
          submitted_by: {
            name: expect.any(String),
            link: expect.any(String)
          },
          proposals: expect.arrayContaining([
            expect.objectContaining({
              title: expect.any(String),
              proposal_blurb: expect.any(String),
              about: expect.any(String),
              source: expect.any(String),
              end_timestamp: expect.any(Number),
              date: expect.stringMatching(dateRegex),
              verified: expect.any(Boolean),
              submitted_by: {
                name: expect.any(String),
                link: expect.any(String)
              }
            })
          ])
        })
      ])
    });
  }
);

// RESTORE WINDOW
Object.assign(window, origWindow);
delete window.web3;
delete window.ethereum;

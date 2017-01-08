export default {
  fuelSavings: {
    newMpg: '',
    tradeMpg: '',
    newPpg: '',
    tradePpg: '',
    milesDriven: '',
    milesDrivenTimeframe: 'week',
    displayResults: false,
    dateModified: null,
    necessaryDataIsProvidedToCalculateSavings: false,
    savings: {
      monthly: 0,
      annual: 0,
      threeYear: 0
    }
  },
  testing: {
    totalScore: 10,
    options: [ // variants of available explorejs optimization options
      {cache: false, prediction: ['simple'], fallback: false, batching: 'simple'},
      {cache: false, prediction: ['simple'], fallback: false, batching: 'merging'},
      {cache: true, prediction: ['simple'], fallback: false, batching: 'simple'},
      {cache: true, prediction: ['simple'], fallback: false, batching: 'merging'},
      {cache: true, prediction: ['simple'], fallback: true, batching: 'simple'},
      {cache: true, prediction: ['simple'], fallback: true, batching: 'merging'},
      {cache: true, prediction: ['simple', 'widerContext'], fallback: false, batching: 'simple'},
      {cache: true, prediction: ['simple', 'widerContext'], fallback: false, batching: 'merging'},
      {cache: true, prediction: ['simple', 'widerContext'], fallback: true, batching: 'simple'},
      {cache: true, prediction: ['simple', 'widerContext'], fallback: true, batching: 'merging'},
    ],

    scenarios: [
      {
        name: 'fullOptimization',
        config: {
          cache: true,
          fallback: true,
          prediction: ['basic', 'widerContext'],
          batching: 'merging'
        },
        sessions: [ // every user explorejs session recorded
          {
            sessionId: 12435,
            startTime: '2016-12-21 13:34:12',
            endTime: '2016-12-21 13:34:12',
            score: 4, // only one session can have score!!,
            recordedActions: [ // every user movement will trigger the action on the session and some reducer will push this action into recording... not sure if a good idea...
              {
                type: 'RECORD_SNAPSHOT',
                time: '2015-02-34 23:34:01.432',
                viewportWidth: 900, // the viewport height in this step
                viewportHeigth: 234,
                viewportStart: '2015-01-23 24:00',
                viewportEnd: '2015-03-20 14:00',
              }
            ]
          }
        ]
      }
    ],
    currentScenario: 0, // TODO propably this will be handled in routing state
    scoreConfirmQueue: [ // the array of actions which need confirmation to override previous session of the same scenario
      {
        type: 'SESSION_SCORE',
        sessionId: 12345,
        override: false, // if user clicks ok, copy this action but set override to true
        score: 134
      }
    ]
  }
};

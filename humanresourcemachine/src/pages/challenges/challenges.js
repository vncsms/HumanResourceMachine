const takeAndOut = {
    name: 'Take and Out',
    memory: new Array(20).fill(null),
    tests: [
        {
            inbox: [1,2,3,4,5,6,7,8,9],
            outbox: [1,2,3,4,5,6,7,8,9],
        },
    ],
    validateAnswer: [
        {
            inbox: [1,3,5,7,9,11,13,15],
            outbox: [1,3,5,7,9,11,13,15],
        },
    ],
}

export const challenges = [
    takeAndOut,
]
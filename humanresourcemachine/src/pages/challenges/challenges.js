const takeAndOut = {
    name: 'In and Out',
    memory: new Array(20).fill(null),
    description: 'For each item from inbox put them in the outbox',
    tests: [
        {
            inbox: [1,2,3,4,5,6,7,8,9],
            outbox: [9,8,7,6,5,4,3,2,1],
        }
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

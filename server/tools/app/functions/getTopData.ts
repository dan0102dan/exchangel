import { getAggregatedData } from './'

export default async (sortOrder) => {
    return getAggregatedData([
        {
            $addFields: {
                maxPriceDifferencePercent: {
                    $divide: [
                        { $toDouble: "$last" },
                        { $toDouble: "$open24h" }
                    ]
                }
            }
        },
        {
            $sort: {
                maxPriceDifferencePercent: sortOrder
            }
        },
        {
            $limit: 5
        },
        {
            $project: {
                maxPriceDifferencePercent: 0,
                _id: 0
            }
        }
    ])
}
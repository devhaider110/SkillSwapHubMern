const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');

// Get leaderboard data
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'mentors', period = 'alltime', limit = 10 } = req.query;

    // Build date filter for period
    let dateFilter = {};
    if (period === 'week') {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      dateFilter = { createdAt: { $gte: startDate } };
    } else if (period === 'month') {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      dateFilter = { createdAt: { $gte: startDate } };
    }

    // Aggregation pipeline
    let pipeline = [];

    // 1. Match users based on role if needed
    if (type === 'mentors') {
      pipeline.push({ $match: { role: { $in: ['mentor', 'user'] } } });
    } else {
      pipeline.push({ $match: {} });
    }

    // 2. Lookup completed swaps (as mentor or learner)
    pipeline.push({
      $lookup: {
        from: 'swaprequests',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $or: [
                    { $eq: ['$receiverId', '$$userId'] },
                    { $eq: ['$requesterId', '$$userId'] }
                  ]},
                  { $eq: ['$status', 'completed'] },
                ]
              }
            }
          },
          // Apply date filter for period
          ...(period !== 'alltime' ? [{
            $match: {
              createdAt: dateFilter.createdAt
            }
          }] : [])
        ],
        as: 'completedSwapsData'
      }
    });

    // 3. Add computed fields
    pipeline.push({
      $addFields: {
        totalSwaps: { $size: '$completedSwapsData' },
        // For mentors: count swaps where user is receiver (teacher)
        mentorSwaps: {
          $size: {
            $filter: {
              input: '$completedSwapsData',
              as: 'swap',
              cond: { $eq: ['$$swap.receiverId', '$_id'] }
            }
          }
        },
        // For learners: count swaps where user is requester
        learnerSwaps: {
          $size: {
            $filter: {
              input: '$completedSwapsData',
              as: 'swap',
              cond: { $eq: ['$$swap.requesterId', '$_id'] }
            }
          }
        }
      }
    });

    // 4. Sort based on type
    if (type === 'mentors') {
      pipeline.push({ $sort: { rating: -1, totalSwaps: -1 } });
    } else if (type === 'learners') {
      pipeline.push({ $sort: { totalSwaps: -1, rating: -1 } });
    } else { // active
      pipeline.push({ $sort: { totalSwaps: -1 } });
    }

    // 5. Limit results
    pipeline.push({ $limit: parseInt(limit) });

    // 6. Select fields to return
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        username: 1,
        profilePic: 1,
        rating: 1,
        completedSwaps: 1,
        hoursTaught: 1,
        hoursLearned: 1,
        totalSwaps: 1,
        mentorSwaps: 1,
        learnerSwaps: 1,
      }
    });

    const users = await User.aggregate(pipeline);

    // Attach rank
    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    res.status(200).json({
      success: true,
      leaderboard: rankedUsers,
      type,
      period,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
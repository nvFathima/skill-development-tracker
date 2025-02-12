const Goal = require('../models/Goals');
const Post = require('../models/Posts');
const Skill = require('../models/Skills');
const User = require('../models/User');

const getAdminReports = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    // 🟢 Active Users: Count users who were active in the last 7 days
    const activeUsers = await User.countDocuments({ lastActiveTime: { $gte: sevenDaysAgo } });

    // 🟢 New Users in the last 30 days
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // 🟢 Total Users
    const totalUsers = await User.countDocuments();

    // 🟢 Total Skills & Goals
    const totalSkills = await Skill.countDocuments();
    const totalGoals = await Goal.countDocuments();
    const completedGoals = await Goal.countDocuments({ status: "Completed" });

    // Calculate Goal Completion Rate
    const goalCompletionRate = totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(2) : 0;

    // 🟢 Total Posts
    const totalPosts = await Post.countDocuments();

    // 🟢 Most Popular Post (Fixing the issue)
    const mostPopularPost = await Post.aggregate([
      {
        $addFields: { 
          likesCount: { $size: { $ifNull: ["$likes", []] } }, 
          commentsCount: { $size: { $ifNull: ["$comments", []] } } 
        }
      },
      { $sort: { likesCount: -1, commentsCount: -1 } },
      { $limit: 1 },
      {
        $project: { 
          title: 1, 
          likesCount: 1, 
          commentsCount: 1 
        }
      }
    ]);
    

    // 🟢 Flagged Posts Count
    const flaggedPosts = await Post.countDocuments({ "flags.status": "pending" });

    res.status(200).json({
      users: { totalUsers, activeUsers, newUsers },
      skillsGoals: { totalSkills, totalGoals, goalCompletionRate },
      forum: { totalPosts, mostPopularPost: mostPopularPost[0] || null, flaggedPosts },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};


module.exports = {getAdminReports};
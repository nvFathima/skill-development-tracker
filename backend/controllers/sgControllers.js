const Skill = require('../models/Skills');
const Goal = require('../models/Goals');
const User = require('../models/User');
const { createNotification } = require('../controllers/notificationControllers');

// Get a list of all users' skills with associated goals
const getAllUsersSkillsAndGoals = async (req, res) => {
  try {
    const users = await User.find().select('fullName email');
    const skills = await Skill.find().populate('userId', 'fullName email');
    const goals = await Goal.find()
        .populate('userId', 'fullName email') // Populates user details
        .populate('associatedSkills', 'name'); // Populates associated skill names

    res.status(200).json({
      users,
      skills,
      goals,
    });
  } catch (error) {
    console.error('Error fetching users, skills, and goals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Notify users of overdue goals
const notifyOverdueGoals = async (req, res) => {
  try {
    const today = new Date();
    const overdueGoals = await Goal.find({
      targetCompletionDate: { $lt: today },
      status: { $ne: 'Completed' },
    }).populate('userId', 'fullName email');

    if (overdueGoals.length === 0) {
      return res.status(200).json({ message: 'No overdue goals found' });
    }

    for (const goal of overdueGoals) {
      const message = `Your goal "${goal.title}" is overdue! Please take action.`;
      await createNotification(goal.userId._id, message);
    }

    res.status(200).json({ message: `${overdueGoals.length} notifications sent successfully.` });
  } catch (error) {
    console.error('Error notifying overdue goals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update skill progress
// const updateSkillProgress = async (req, res) => {
//   const { skillId } = req.params;
//   const { progress } = req.body;

//   try {
//     const updatedSkill = await Skill.findByIdAndUpdate(
//       skillId,
//       { progress },
//       { new: true, runValidators: true }
//     );
//     if (!updatedSkill) {
//       return res.status(404).json({ message: 'Skill not found' });
//     }
//     res.status(200).json(updatedSkill);
//   } catch (error) {
//     console.error('Error updating skill progress:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// Delete a user's skill
// const deleteSkill = async (req, res) => {
//   const { skillId } = req.params;

//   try {
//     const deletedSkill = await Skill.findByIdAndDelete(skillId);
//     if (!deletedSkill) {
//       return res.status(404).json({ message: 'Skill not found' });
//     }
//     res.status(200).json({ message: 'Skill deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting skill:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// Delete a user's goal
// const deleteGoal = async (req, res) => {
//   const { goalId } = req.params;

//   try {
//     const deletedGoal = await Goal.findByIdAndDelete(goalId);
//     if (!deletedGoal) {
//       return res.status(404).json({ message: 'Goal not found' });
//     }
//     res.status(200).json({ message: 'Goal deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting goal:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

module.exports = {
  getAllUsersSkillsAndGoals,
  notifyOverdueGoals, };

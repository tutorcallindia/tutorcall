const User =
  require("../models/User");

const deductMinute =
  async (userId) => {

  try {

    const user =
      await User.findById(
        userId
      );

    if (!user) {

      return;
    }

    if (
      user.totalWalletMinutes <= 0
    ) {

      return;
    }

    user.totalWalletMinutes -= 1;

    await user.save();

    console.log(

      `1 minute deducted from:
      ${user.email}`

    );

    console.log(

      `Remaining:
      ${user.totalWalletMinutes}`

    );

  }

  catch (error) {

    console.log(error);
  }
};

module.exports = {
  deductMinute
};

const UserModel = require("../../models/UserModel");
const bcrypt = require("bcrypt");
  
exports.profile = async (req, res) => {
  try {
    const { body } = req;

    const currentUser = await UserModel.findOne({ email: body.email });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    if(!body.password){
      updatedPassword = currentUser.password;
    }else{
      updatedPassword = await bcrypt.hash(body.password, 10);  
    }

    const updatedUser = {
      first_name: body.first_name,
      last_name: body.last_name,
      gender: body.gender,
      Dob: body.Dob,
      password: updatedPassword,
    };

    await UserModel.updateOne(
      { email: currentUser.email },
      { $set: updatedUser }
    );

    res.status(200).json("Success");
  } catch (error) {
    res.status(500).json(error);
  }
}


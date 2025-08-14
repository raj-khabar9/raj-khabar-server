import mongoose from "mongoose";

const deviceRegistrationSchema = new mongoose.Schema({
  deviceName: {
    type: String
  },
  deviceId: {
    type: String,
    required: true,
    unique:true
  },
  fcmToken: {
    type: String
  },
  notificationEnabled: {
    type: Boolean,
  }
}
);

export default mongoose.model("DeviceRegistration", deviceRegistrationSchema);

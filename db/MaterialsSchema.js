




const MaterialSchema = new mongoose.Schema({
  assets: [{ type: String, required: true }],
});

module.exports = mongoose.model('Material', MaterialSchema);

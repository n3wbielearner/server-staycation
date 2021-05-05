const Item = require("../models/Item");
const Treasure = require("../models/Activity");
const Treveler = require("../models/Booking");
const Category = require("../models/Category");
const Bank = require("../models/Bank");

module.exports = {
  landingPage: async (req, res) => {
    try {
      const mostPicked = await Item.find()
        .select("_id title country city price unit imageId")
        .limit(5)
        .populate({ path: "imageId", select: "_id imageUrl" });

      const category = await Category.find()
        .select("_id name")
        .limit(3)
        .populate({
          path: "itemId",
          select: "_id title country city isPopular  imageId",
          perDocumentLimit: 4,
          option: { sort: { sumBooking: -1 } }, //descending order
          populate: {
            path: "imageId",
            select: "_id imageUrl",
            perDocumentLimit: 1,
          },
        });

      const treveler = await Treveler.find();
      const treasure = await Treasure.find();
      const city = await Item.find();

      for (let i = 0; i < category.length; i++) {
        for (let x = 0; x < category[i].itemId.length; x++) {
          const item = await Item.findOne({ _id: category[i].itemId[x]._id });
          item.isPopular = false;
          await item.save();

          //for each category, the most booking will be set popular
          //category[i].itemId[0] is the most booked as it is sorted descendingly by sumBooking (see above)
          if (category[i].itemId[0] === category[i].itemId[x]) {
            item.isPopular = true;
            await item.save();
          }
        }
      }

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl: "images/testimonial2.jpg",
        name: "Happy Family",
        rate: 4.55,
        content:
          "What a great trip with my family and I should try again next time soon ...",
        familyName: "Angga",
        familyOccupation: "Product Designer",
      };

      res.status(200).json({
        hero: {
          travelers: treveler.length,
          treasures: treasure.length,
          cities: city.length,
        },
        mostPicked,
        category,
        testimonial,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  detailPage: async (req, res) => {
    try {
      const { id } = req.params;
      //get all fields of item where _id = id
      const item = await Item.findOne({ _id: id })
        .populate({ path: "featureId", select: "_id name qty imageUrl" })
        .populate({ path: "activityId", select: "_id name type imageUrl" })
        .populate({ path: "imageId", select: "_id imageUrl" });

      const bank = await Bank.find();

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl: "images/testimonial1.jpg",
        name: "Happy Family",
        rate: 4.55,
        content:
          "What a great trip with my family and I should try again next time soon ...",
        familyName: "Angga",
        familyOccupation: "Product Designer",
      };

      //try to see the effect of ...item (only) in the postman,
      //you will see that you need to add ._doc to the item to get the needed result
      res.status(200).json({
        ...item._doc,
        bank,
        testimonial,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

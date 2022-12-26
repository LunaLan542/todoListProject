//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://LunaLan542:Shangan2023!@cluster0.gkj93rx.mongodb.net/todolistDB");
const itemsSchema = new Schema({
  name: String,
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (error) {
        if (error) {
          console.log(error);
        } else {
          console.log("Successfully saved default Items!");
        };
      }); res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    };
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, FoundList) {
    if (!err) {
      if (!FoundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: FoundList.name, newListItems: FoundList.items });
      };
    } else {
      console.log(!err);
    };
  });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newAdd = new Item({
    name: itemName
  });

  if (listName === "Today") {
    newAdd.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, FoundList) {
      FoundList.items.push(newAdd);
      FoundList.save();
      res.redirect("/" + listName);
    });
  };
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log("Checked ID has been successully removed!")
      };
    }); res.redirect("/");
  } else {
    List.findOneAndUpdate({ name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, FoundList) {
        if (!err) {
          res.redirect("/" + listName);
        };
      });
  };


});


app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

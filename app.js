var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var sanitizer = require('express-sanitizer');

//APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect(process.env.DATABASEURL, {useMongoClient: true});
app.use(methodOverride("_method"));
app.use(sanitizer());
//MONGOOSE MODEL CONFIG
var blogSchema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

/*Blog.create({
    title: "Sample Blog Post",
    image: "https://source.unsplash.com/random",
    body: "Just learning stuff with express and mongoDB. Going well till now :)"
});*/

//RESTful Routes

app.get('/', function(req, res){
    res.redirect("/blogs");
});

app.get('/blogs', function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("error!");
        } else {
            res.render('index', {blogs: blogs});    
        }
    });
});

app.get('/blogs/new', function(req, res){
    res.render('new');
});

app.post('/blogs', function(req, res){
    var Title = req.body.blog.title;
    var Image = req.body.blog.image;
    var Body = req.sanitize(req.body.blog.body);
    
    Blog.create({
        title: Title,
        image: Image,
        body: Body
    }, function(err, newBlog){
        if(err){
            res.render('new');
        } else {
            res.redirect('/blogs');
        }
    })
});

app.get('/blogs/:id', function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render('show', {blog: foundBlog});
        }
    });
});

app.get('/blogs/:id/edit', function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render('edit', {blog: foundBlog});
        }
    });
});

app.put('/blogs/:id', function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
       if(err){
           res.send("There was some error. Please go back and update the form again..");
        } else{
            res.redirect('/blogs/' + req.params.id);
        }
   }); 
});

app.delete('/blogs/:id', function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.send("We have encountered an error. Sorry for the inconvenience..");
       } else {
           res.redirect('/blogs');
       }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started.");
});
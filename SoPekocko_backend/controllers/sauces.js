const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => {res.status(201).json({message: 'Sauce enregistrée!'});})
        .catch((error) => {res.status(400).json({error: error});});
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {res.status(200).json(sauce);})
        .catch((error) => {res.status(404).json({error: error});});
};
  
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    if(req.file){
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.updateOne({_id: req.params.id}, { ...sauceObject, _id: req.params.id })
                        .then(() => {res.status(201).json({message: 'Sauce mise à jour!'});})
                        .catch((error) => {res.status(400).json({error: error});});
                })
            })
            .catch((error) => {res.status(500).json({error: error});});
           
    }else{
        Sauce.updateOne({_id: req.params.id}, { ...sauceObject, _id: req.params.id })
            .then(() => {res.status(201).json({message: 'Sauce mise à jour!'});})
            .catch((error) => {res.status(400).json({error: error});}); 
    }
    
};
  
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                    .catch(error => res.status(400).json({ error }));
            });
        })    
        .catch((error) => {res.status(500).json({error: error});});
};
  
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => {res.status(200).json(sauces);})
        .catch((error) => {res.status(400).json({error: error});});
};

exports.likeSauce = (req, res, next) => {
    //-> {userId:string; like:number}
    //console.log(req.body);
    //console.log(req.body.like);
    //console.log(req.params.id);
    //const sauce = Sauce.findOne({_id: req.params.id});
    //sauce.then((sauces) => {console.log(sauces)});
    //console.log(sauce);
    switch (req.body.like){
        case 0:
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    //res.status(500).json({find:Sauce.usersLiked.find});
                    //return;
                    //console.log('on est avant le if');
                    //if(sauce.usersLiked.find(req.body.userId)){
                    if(sauce.usersLiked.find(user => user === req.body.userId)){
                        //console.log('on est dans le if')
                        Sauce.updateOne({_id: req.params.id}, { 
                            $inc:{likes:-1 }, 
                            $pull:{usersLiked: req.body.userId}, 
                            _id: req.params.id 
                        })
                            .then(() => {res.status(201).json({message: 'Ton avis a été pris en compte!'});})
                            .catch((error) => {res.status(400).json({error: error});});
                        
                    }if(sauce.usersDisliked.find(user => user === req.body.userId)){
                        Sauce.updateOne({_id: req.params.id}, { 
                            $inc:{dislikes:-1 }, 
                            $pull:{usersDisliked: req.body.userId}, 
                            _id: req.params.id 
                        })
                            .then(() => {res.status(201).json({message: 'Ton avis a été pris en compte!'});})
                            .catch((error) => {res.status(400).json({error: error});});
                    }
                })
                .catch((error) => {res.status(404).json({error: error});});    
            break;
        case 1:
            Sauce.updateOne({_id: req.params.id}, { 
                $inc:{likes:1 }, 
                $push:{usersLiked: req.body.userId}, 
                _id: req.params.id 
            })
                .then(() => {res.status(201).json({message: 'Ton avis a été pris en compte!'});})
                .catch((error) => {res.status(400).json({error: error});});
            break;
        case -1:
                Sauce.updateOne({_id: req.params.id}, { 
                    $inc:{dislikes:1 }, 
                    $push:{usersDisliked: req.body.userId}, 
                    _id: req.params.id 
                })
                    .then(() => {res.status(201).json({message: 'Ton avis a été pris en compte!'});})
                    .catch((error) => {res.status(400).json({error: error});});
            break;
        default:
            console.error('not today : mauvaise requête');
    }
};
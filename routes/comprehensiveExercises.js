let express = require('express');
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');
let router = express.Router();

router.get('/', function(req, res, next) {
    res.render('comprehensiveExercises', { title: '就业测评' });
});

router.get('/list', (req, res, next) => {
    let service = new commonService.commonInvoke('comprehensiveExercisesList');
    let pageNumber = req.query.pageNumber;
    let pageSize = sysConfig.pageSize;
    let examType = req.query.examType;
    let difficultyLevel = req.query.difficultyLevel;
    let dataStatus = req.query.dataStatus;

    let parameter = `${pageNumber}/${pageSize}/${examType}/${difficultyLevel}/${dataStatus}`;

    service.queryWithParameter(parameter, (result) => {
        if (result.err) {
            res.json({
                err: true,
                code: result.code,
                msg: result.msg
            });
        } else {
            let dataContent = commonService.buildRenderData('就业测评', pageNumber, result);
            res.json({
                err: false,
                code: result.code,
                msg: result.msg,
                dataContent: dataContent
            });
        }
    });
});

router.post('/', (req, res, next) => {
    let service = new commonService.commonInvoke('addComprehensiveExercises');
    let data = {
        exercisesTitle: req.body.exercisesTitle,
        examKnowledge: req.body.examKnowledge,
        examType: req.body.examType,
        difficultyLevel: req.body.difficultyLevel,
        exercisesDescription: req.body.exercisesDescription,
        documentUrl: req.body.documentUrl,
        loginUser: req.body.loginUser
    };

    service.create(data, (result) => {
        if (result.err) {
            res.json({
                err: true,
                code: result.code,
                msg: result.msg
            });
        } else {
            res.json({
                err: false,
                code: result.code,
                msg: result.msg
            });
        }
    });
});

router.put('/', (req, res, next) => {
    let service = new commonService.commonInvoke('changeComprehensiveExercises');
    let data = {
        exercisesID: req.body.exercisesID,
        exercisesTitle: req.body.exercisesTitle,
        examKnowledge: req.body.examKnowledge,
        examType: req.body.examType,
        difficultyLevel: req.body.difficultyLevel,
        exercisesDescription: req.body.exercisesDescription,
        documentUrl: req.body.documentUrl,
        loginUser: req.body.loginUser
    };

    service.change(data, (result) => {
        if (result.err) {
            res.json({
                err: true,
                code: result.code,
                msg: result.msg
            });
        } else {
            res.json({
                err: false,
                code: result.code,
                msg: result.msg
            });
        }
    });
});

router.put('/status', (req, res, next) => {
    let service = new commonService.commonInvoke('changeComprehensiveExercisesStatus');
    let data = {
        exercisesID: req.body.exercisesID,
        dataStatus: req.body.status,
        loginUser: req.body.loginUser
    };

    service.change(data, (result) => {
        if (result.err) {
            res.json({
                err: true,
                code: result.code,
                msg: result.msg
            });
        } else {
            res.json({
                err: false,
                code: result.code,
                msg: result.msg
            });
        }
    });
});

router.delete('/', (req, res, next) => {
    let service = new commonService.commonInvoke('deleteComprehensiveExercises');
    let exercisesID = req.query.exercisesID;
    let parameter = `${exercisesID}`;

    service.delete(parameter, function(result) {
        if (result.err) {
            res.json({
                err: true,
                code: result.code,
                msg: result.msg
            });
        } else {
            res.json({
                err: false,
                code: result.code,
                msg: result.msg
            });
        }
    });
});

module.exports = router;
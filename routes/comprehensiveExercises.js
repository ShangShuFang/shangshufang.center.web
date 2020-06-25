let express = require('express');
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');
let router = express.Router();

router.get('/', function(req, res, next) {
    res.render('comprehensiveExercises', { title: '综合练习' });
});

router.get('/list', (req, res, next) => {
    let service = new commonService.commonInvoke('comprehensiveExercisesList');
    let pageNumber = req.query.pageNumber;
    let pageSize = sysConfig.pageSize;
    let directionID = 0;
    let categoryID = 0;
    let technologyID = req.query.technologyID;
    let dataStatus = req.query.dataStatus;

    let parameter = `${pageNumber}/${pageSize}/${directionID}/${categoryID}/${technologyID}/${dataStatus}`;

    service.queryWithParameter(parameter, (result) => {
        if (result.err) {
            res.json({
                err: true,
                code: result.code,
                msg: result.msg
            });
        } else {
            let dataContent = commonService.buildRenderData('综合练习', pageNumber, result);
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
        exercisesName: req.body.exercisesName,
        technologyID: req.body.technologyID,
        documentUrl: req.body.documentUrl,
        answerUrl: req.body.answerUrl,
        memo: req.body.memo,
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
        exercisesName: req.body.exercisesName,
        answerUrl: req.body.answerUrl,
        documentUrl: req.body.documentUrl,
        memo: req.body.memo,
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
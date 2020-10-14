let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
    res.render('knowledgeExercises', { title: '习题上传' });
});

//#region 选择题
router.get('/choice/list', function(req, res, next) {
    let service = new commonService.commonInvoke('knowledgeChoiceExercisesList');
    let pageNumber = req.query.pageNumber;
    let pageSize = sysConfig.pageSize;
    let technologyID = req.query.technologyID;
    let knowledgeID = req.query.knowledgeID;
    let dataStatus = req.query.dataStatus;
    let parameter = `${pageNumber}/${pageSize}/${technologyID}/${knowledgeID}/${dataStatus}`;

    service.queryWithParameter(parameter, function(result) {
        if (result.err) {
            res.json({
                err: true,
                code: result.code,
                msg: result.msg
            });
        } else {
            let dataContent = commonService.buildRenderData('知识点练习（选择题）', pageNumber, result);
            res.json({
                err: false,
                code: result.code,
                msg: result.msg,
                dataContent: dataContent
            });
        }
    });
});

router.post('/choice/add', function(req, res, next) {
    let service = new commonService.commonInvoke('addKnowledgeChoiceExercises');
    let data = {
        technologyID: req.body.technologyID,
        knowledgeID: req.body.knowledgeID,
        exercisesTitle: req.body.exercisesTitle,
        exercisesSource: req.body.exercisesSource,
        exercisesType: req.body.exercisesType,
        choiceOptionsJson: req.body.choiceOptionsJson,
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
                msg: result.msg,
                exercisesID: result.content.responseData
            });
        }
    });
});

router.put('/choice/change', function(req, res, next) {
    let service = new commonService.commonInvoke('changeKnowledgeChoiceExercises');
    let data = {
        exercisesID: req.body.exercisesID,
        technologyID: req.body.technologyID,
        knowledgeID: req.body.knowledgeID,
        exercisesTitle: req.body.exercisesTitle,
        exercisesSource: req.body.exercisesSource,
        exercisesType: req.body.exercisesType,
        choiceOptionsJson: req.body.choiceOptionsJson,
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

router.put('/choice/change/status', function(req, res, next) {
    let service = new commonService.commonInvoke('changeKnowledgeChoiceExercisesStatus');
    let data = {
        exercisesID: req.body.exercisesID,
        technologyID: req.body.technologyID,
        knowledgeID: req.body.knowledgeID,
        dataStatus: req.body.dataStatus,
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

router.delete('/choice/delete', function(req, res, next) {
    let service = new commonService.commonInvoke('deleteKnowledgeChoiceExercises');
    let technologyID = req.query.technologyID;
    let knowledgeID = req.query.knowledgeID;
    let exercisesID = req.query.exercisesID;
    let parameter = `${technologyID}/${knowledgeID}/${exercisesID}`;

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
//#endregion

//#region 填空题
router.get('/blank/list', function(req, res, next) {
    let service = new commonService.commonInvoke('knowledgeBlankExercisesList');
    let pageNumber = req.query.pageNumber;
    let pageSize = sysConfig.pageSize;
    let technologyID = req.query.technologyID;
    let knowledgeID = req.query.knowledgeID;
    let dataStatus = req.query.dataStatus;
    let parameter = `${pageNumber}/${pageSize}/${technologyID}/${knowledgeID}/${dataStatus}`;

    service.queryWithParameter(parameter, function(result) {
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
                msg: result.msg,
                dataList: result.content.responseData
            });
        }
    });
});

router.post('/blank/add', function(req, res, next) {
    let service = new commonService.commonInvoke('addKnowledgeBlankExercises');
    let data = {
        technologyID: req.body.technologyID,
        knowledgeID: req.body.knowledgeID,
        exercisesTitle: req.body.exercisesTitle,
        exercisesSource: req.body.exercisesSource,
        rightAnswers: req.body.rightAnswers,
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

router.put('/blank/change', function(req, res, next) {
    let service = new commonService.commonInvoke('changeKnowledgeBlankExercises');
    let data = {
        exercisesID: req.body.exercisesID,
        technologyID: req.body.technologyID,
        knowledgeID: req.body.knowledgeID,
        exercisesTitle: req.body.exercisesTitle,
        exercisesSource: req.body.exercisesSource,
        rightAnswers: req.body.rightAnswers,
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

router.put('/blank/change/status', function(req, res, next) {
    let service = new commonService.commonInvoke('changeKnowledgeBlankExercisesStatus');
    let data = {
        exercisesID: req.body.exercisesID,
        technologyID: req.body.technologyID,
        knowledgeID: req.body.knowledgeID,
        dataStatus: req.body.dataStatus,
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

router.delete('/blank/delete', function(req, res, next) {
    let service = new commonService.commonInvoke('deleteKnowledgeChoiceExercises');
    let technologyID = req.query.technologyID;
    let knowledgeID = req.query.knowledgeID;
    let exercisesID = req.query.exercisesID;
    let parameter = `${technologyID}/${knowledgeID}/${exercisesID}`;

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
//#endregion


//#region 编程题
router.get('/program/files', function(req, res, next) {
    let service = new commonService.commonInvoke('knowledgeProgramExercisesList');
    let technologyID = req.query.technologyID;
    let knowledgeID = req.query.knowledgeID;
    let parameter = `1/999/${technologyID}/${knowledgeID}`;

    service.queryWithParameter(parameter, function(result) {
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
                msg: result.msg,
                files: result.content.responseData
            });
        }
    });
});

router.post('/program/add', (req, res, next) => {
    let service = new commonService.commonInvoke('addKnowledgeProgramExercises');
    let data = {
        technologyID: req.body.technologyID,
        learningPhaseID: req.body.learningPhaseID,
        knowledgeID: req.body.knowledgeID,
        exercisesJson: req.body.exercisesJson,
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
//#endregion

module.exports = router;
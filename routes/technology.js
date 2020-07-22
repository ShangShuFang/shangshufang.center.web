const express = require('express');
const router = express.Router();
const sysConfig = require('../config/sysConfig');
const parameterUtils = require('../common/parameterUtils');
const commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
    res.render('technology', { title: '热门技术' });
});

router.get('/dataList', (req, res, next) => {
    let service = new commonService.commonInvoke('technologyList');
    let pageNumber = parseInt(req.query.pageNumber);
    let directionID = parseInt(req.query.directionID);
    let categoryID = parseInt(req.query.categoryID);

    let parameter = `${pageNumber}/${sysConfig.pageSize}/${directionID}/${categoryID}/NULL`;

    service.queryWithParameter(parameter, (result) => {
        if (result.err) {
            res.json({
                err: true,
                code: result.code,
                msg: result.msg
            });
        } else {
            let dataContent = commonService.buildRenderData('热门技术', pageNumber, result);
            res.json({
                err: false,
                code: result.code,
                msg: result.msg,
                dataContent: dataContent
            });
        }
    });
});

router.get('/programmingLanguage', function(req, res, next) {
    let service = new commonService.commonInvoke('programmingLanguage');

    service.queryWithParameter('', function(result) {
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

router.get('/checkTechnologyName', function(req, res, next) {
    let service = new commonService.commonInvoke('checkTechnologyNameExist');
    let technologyName = parameterUtils.convertSpecialChar(req.query.technologyName);

    service.queryWithParameter(technologyName, function(result) {
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
                result: result.content.responseData
            });
        }
    });
});

router.post('/', (req, res, next) => {
    let service = new commonService.commonInvoke('addTechnology');
    let data = {
        languageID: req.body.languageID,
        technologyName: req.body.technologyName,
        technologyStars: req.body.technologyStars,
        technologyMemo: req.body.technologyMemo,
        directionID: req.body.directionID,
        categoryID: req.body.categoryID,
        difficultyLevel: req.body.difficultyLevel,
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
    let service = new commonService.commonInvoke('changeTechnology');
    let data = {
        technologyID: req.body.technologyID,
        technologyName: req.body.technologyName,
        technologyStars: req.body.technologyStars,
        technologyMemo: req.body.technologyMemo,
        directionID: req.body.directionID,
        categoryID: req.body.categoryID,
        difficultyLevel: req.body.difficultyLevel,
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
    let service = new commonService.commonInvoke('changeTechnologyStatus');
    let data = {
        technologyID: req.body.technologyID,
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

router.put('/thumbnail', (req, res, next) => {
    let service = new commonService.commonInvoke('changeTechnologyThumbnail');
    let data = {
        technologyID: req.body.technologyID,
        technologyThumbnailSquare: req.body.technologyThumbnailSquare,
        technologyThumbnailRectangle: req.body.technologyThumbnailRectangle,
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
    let service = new commonService.commonInvoke('deleteTechnology');
    let technologyID = req.query.technologyID;

    service.delete(technologyID, function(result) {
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
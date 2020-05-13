let express = require('express');
let router = express.Router();
let sysConfig = require('../config/sysConfig');
let commonService = require('../service/commonService');

router.get('/', function(req, res, next) {
  res.render('company', { title: '合作企业' });
});

router.get('/dataList', (req, res, next) => {
  let service = new commonService.commonInvoke('companyList');
  let pageNumber = parseInt(req.query.pageNumber);
  let provinceCode = req.query.provinceCode === undefined ? 0 : req.query.provinceCode;
  let cityCode = req.query.cityCode === undefined ? 0 : req.query.cityCode;

  let parameter = `${pageNumber}/${sysConfig.pageSize}/${provinceCode}/${cityCode}/NULL`;

  service.queryWithParameter(parameter,  (result) => {
    if (result.err) {
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    } else {
      let dataContent = commonService.buildRenderData('合作企业', pageNumber, result);
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataContent: dataContent
      });
    }
  });
});

router.get('/checkCompanyNameExist', (req, res, next) => {
  let service = new commonService.commonInvoke('checkCompanyNameExist');
  let companyName = req.query.companyName;

  service.queryWithParameter(companyName,  (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        result: result.content.responseData
      });
    }
  });
});

router.get('/checkCellphoneExist', (req, res, next) => {
  let service = new commonService.commonInvoke('checkCellphoneExist');
  let cellphone = req.query.cellphone;

  service.queryWithParameter(cellphone, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        result: result.content.responseData
      });
    }
  });
});

router.get('/usingTechnology', (req, res, next) => {
  let service = new commonService.commonInvoke('usingTechnologyList');
  let companyID = req.query.companyID;

  service.queryWithParameter(companyID, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/related/technology', (req, res, next) => {
  let service = new commonService.commonInvoke('companyUsingKnowledgeRelatedTechnology');
  let companyID = req.query.companyID;

  service.queryWithParameter(companyID, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/related/learningPhase', (req, res, next) => {
  let service = new commonService.commonInvoke('companyUsingKnowledgeRelatedLearningPhase');
  let companyID = req.query.companyID;
  let technologyID = req.query.technologyID;
  let parameter = `${companyID}/${technologyID}`;

  service.queryWithParameter(parameter, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.get('/related/knowledge', (req, res, next) => {
  let service = new commonService.commonInvoke('companyUsingKnowledgeRelatedList');
  let companyID = req.query.companyID;
  let technologyID = req.query.technologyID;
  let learningPhaseID = req.query.learningPhaseID;
  let parameter = `${companyID}/${technologyID}/${learningPhaseID}`;

  service.queryWithParameter(parameter, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg,
        dataList: result.content.responseData
      });
    }
  });
});

router.post('/', (req, res, next) => {
  let service = new commonService.commonInvoke('addCompany');
  let data = {
    companyName: req.body.companyName,
    companyAbbreviation: req.body.companyAbbreviation,
    provinceCode: req.body.provinceCode,
    cityCode: req.body.cityCode,
    districtCode: req.body.districtCode,
    address: req.body.address,
    contacts: req.body.contacts,
    cellphone: req.body.cellphone,
    businessLicense: '',
    loginUser: req.body.loginUser
  };

  service.create(data, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg
      });
    }
  });
});

router.post('/usingTechnology', (req, res, next) => {
  let service = new commonService.commonInvoke('addUsingTechnology');
  let data = {
    companyID: req.body.companyID,
    technologyIdList: req.body.technologyIdList,
    loginUser: req.body.loginUser
  };

  service.create(data, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg
      });
    }
  });
});

router.post('/usingKnowledge', (req, res, next) => {
  let service = new commonService.commonInvoke('companyUsingKnowledge');
  let data = {
    companyID: req.body.companyID,
    technologyID: req.body.technologyID,
    learningPhaseID: req.body.learningPhaseID,
    knowledgeIdList: req.body.knowledgeIdList,
    loginUser: req.body.loginUser
  };

  service.create(data, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg
      });
    }
  });
});

router.put('/', (req, res, next) => {
  let service = new commonService.commonInvoke('changeCompany');
  let data = {
    companyID: req.body.companyID,
    companyName: req.body.companyName,
    companyAbbreviation: req.body.companyAbbreviation,
    provinceCode: req.body.provinceCode,
    cityCode: req.body.cityCode,
    districtCode: req.body.districtCode,
    address: req.body.address,
    contacts: req.body.contacts,
    cellphone: req.body.cellphone,
    businessLicense: '',
    loginUser: req.body.loginUser
  };

  service.change(data, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg
      });
    }
  });
});

router.put('/status', (req, res, next) => {
  let service = new commonService.commonInvoke('changeCompanyStatus');
  let data = {
    companyID: req.body.companyID,
    dataStatus: req.body.status,
    loginUser: req.body.loginUser
  };

  service.change(data, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg
      });
    }
  });
});

router.put('/brand', (req, res, next) => {
  let service = new commonService.commonInvoke('changeCompanyLogo');
  let data = {
    companyID: req.body.companyID,
    brand: req.body.brand,
    loginUser: req.body.loginUser
  };

  service.change(data, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg
      });
    }
  });
});

router.put('/memo', (req, res, next) => {
  let service = new commonService.commonInvoke('changeCompanyMemo');
  let data = {
    companyID: req.body.companyID,
    memo: req.body.memo,
    loginUser: req.body.loginUser
  };

  service.change(data, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg
      });
    }
  });
});

router.put('/recruitLevel', (req, res, next) => {
  let service = new commonService.commonInvoke('changeCompanyRecruitLevel');
  let data = {
    companyID: req.body.companyID,
    recruitLevel: req.body.recruitLevel,
    loginUser: req.body.loginUser
  };

  service.change(data, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg
      });
    }
  });
});

router.delete('/', (req, res, next) => {
  let service = new commonService.commonInvoke('deleteCompany');
  let companyID = req.query.companyID;

  service.delete(companyID, (result) => {
    if(result.err){
      res.json({
        err: true,
        code: result.code,
        msg: result.msg
      });
    }else{
      res.json({
        err: false,
        code: result.code,
        msg: result.msg
      });
    }
  });
});

module.exports = router;

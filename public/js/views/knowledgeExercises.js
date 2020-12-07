let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
	$scope.model = {
		technologyID: 0,
		technologyName: '',
		learningPhaseID: 0,
		learningPhaseName: '',
		knowledgeID: 0,
		knowledgeName: '',
		loginUser: commonUtility.getLoginUser(),
		choiceQuestion: {
			dataList: [],
			pageNumber: 1,
			totalCount: 0,
			maxPageNumber: 0,
			dataStatus: 'NULL'
		},
		fillInBlankQuestion: {
			dataList: [],
			pageNumber: 1,
			totalCount: 0,
			maxPageNumber: 0,
			dataStatus: 'NULL'
		},
		programmeQuestion: {
			dataList: [],
			pageNumber: 1,
			totalCount: 0,
			maxPageNumber: 0,
			dataStatus: 'NULL',
			documentUrl: '',
			answerGitUrl: ''
		},
		approveExercises: {
			title: '',
			type: '',
			status: '',
			question: {}
		}
	};

	//#region 选择题
	$scope.loadChoiceQuestionList = function () {
		//取得当前知识点的选择题
		$http.get('/knowledge/exercises/choice/list?'
			.concat(`pageNumber=${$scope.model.choiceQuestion.pageNumber}`)
			.concat(`&technologyID=${$scope.model.technologyID}`)
			.concat(`&knowledgeID=${$scope.model.knowledgeID}`)
			.concat(`&dataStatus=${$scope.model.choiceQuestion.dataStatus}`))
			.then(function successCallback(response) {
				if (response.data.err) {
					bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
					return false;
				}

				$scope.model.choiceQuestion.totalCount = response.data.dataContent.totalCount;
				$scope.model.choiceQuestion.maxPageNumber = Math.ceil(response.data.dataContent.totalCount / response.data.dataContent.pageSize);

				if (response.data.dataContent.totalCount > 0) {
					response.data.dataContent.dataList.forEach((data) => {
						data.isNew = false;
						data.isShowEdit = false;
						$scope.model.choiceQuestion.dataList.push(data);
					});
					return false;
				}
				$scope.model.choiceQuestion.dataList = [];
			}, function errorCallback(response) {
				bootbox.alert(localMessage.NETWORK_ERROR);
			});
	};

	$scope.onFilterChoiceQuestion = function (dataStatus) {
		if ($scope.model.choiceQuestion.dataStatus === dataStatus) {
			return false;
		}
		$scope.model.choiceQuestion.dataStatus = dataStatus;
		$scope.model.choiceQuestion.pageNumber = 1;
		$scope.model.choiceQuestion.dataList = [];
		$scope.loadChoiceQuestionList();
	};

	$scope.onShowApproveDialog = function (type, choiceQuestion) {
		$scope.model.approveExercises.title = choiceQuestion.exercisesTitle.length > 25 ?
			choiceQuestion.exercisesTitle.substr(0, 25).concat('...') :
			choiceQuestion.exercisesTitle;

		$scope.model.type = type;
		$scope.model.question = choiceQuestion;
		$scope.model.approveExercises.status = '';
		$('#kt_modal_status').modal('show');
	};

	$scope.onChangeStatus = function () {
		switch ($scope.model.type) {
			case 'C':
				$scope.changeChoiceStatus();
				break;
			case 'B':
				$scope.changeBlankStatus();
				break;
			case 'P':
				break;
		}
	};

	$scope.changeChoiceStatus = function () {
		if ($scope.model.question.dataStatus === $scope.model.approveExercises.status) {
			layer.msg('修改的状态不能和当前状态相同！');
			return false;
		}
		$http.put('/knowledge/exercises/choice/change/status', {
			exercisesID: $scope.model.question.exercisesID,
			technologyID: $scope.model.technologyID,
			knowledgeID: $scope.model.knowledgeID,
			dataStatus: $scope.model.approveExercises.status,
			loginUser: $scope.model.loginUser.adminID
		}).then(function successCallback(response) {
			if (response.data.err) {
				bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
				return false;
			}
			let currentTime = new Date().toLocaleString('chinese', { hour12: false });
			$scope.model.question.dataStatus = $scope.model.approveExercises.status;
			$scope.model.question.dataStatusText = $scope.model.approveExercises.status === 'A' ? '审批通过' : '审批未通过';
			$scope.model.question.updateUser = $scope.model.loginUser.adminName;
			$scope.model.question.updateTime = currentTime.replaceAll('/', '-');

			if ($scope.model.choiceQuestion.dataStatus === 'NULL') {
				$('#kt_modal_status').modal('hide');
				return false;
			}

			$scope.removeChoiceQuestion($scope.model.question);
			$('#kt_modal_status').modal('hide');

		}, function errorCallback(response) {
			bootbox.alert(localMessage.NETWORK_ERROR);
		});
	};

	$scope.onCreateChoiceQuestion = function () {
		$scope.model.choiceQuestion.dataList.push($scope.buildChoiceQuestion());
	};

	$scope.buildChoiceQuestion = function () {
		let choiceQuestion = {};
		choiceQuestion.exercisesTitle = '';
		choiceQuestion.exercisesSource = '';
		choiceQuestion.exercisesType = 'S'; //默认为单项选择
		choiceQuestion.isNew = true;
		choiceQuestion.choiceOptions = [{
			optionText: '',
			rightAnswer: false
		},
		{
			optionText: '',
			rightAnswer: false
		},
		{
			optionText: '',
			rightAnswer: false
		},
		{
			optionText: '',
			rightAnswer: false
		}
		];
		choiceQuestion.isShowEdit = false;
		return choiceQuestion;
	};

	$scope.toggleChoiceQuestionEdit = function (choiceQuestion, isShow) {
		choiceQuestion.isShowEdit = isShow;
	};

	$scope.checkChoiceData = function (choiceQuestion) {
		let answerCount = 0;
		if (choiceQuestion.exercisesTitle.length === 0) {
			layer.msg('请填写题目标题！');
			return false;
		}
		if (choiceQuestion.exercisesSource.length === 0) {
			layer.msg('请填写题目来源！');
			return false;
		}
		for (let i = 0; i <= choiceQuestion.choiceOptions.length - 1; i++) {
			if (choiceQuestion.choiceOptions[i].optionText.length === 0) {
				layer.msg('不能有内容为空的选项内容！');
				return false;
			}
		}

		for (let i = 0; i <= choiceQuestion.choiceOptions.length - 1; i++) {
			if (choiceQuestion.choiceOptions[i].rightAnswer) {
				answerCount++;
			}
		}
		if (answerCount === 0) {
			layer.msg('请设置正确选项！');
			return false;
		}
		if (choiceQuestion.exercisesType === 'M' && answerCount < 2) {
			layer.msg('多项选择题至少应有不少于两个正确选项！');
			return false;
		}
		return true;
	};

	$scope.saveChoiceQuestion = function (choiceQuestion) {
		//数据校验
		if (!$scope.checkChoiceData(choiceQuestion)) {
			return false;
		}

		if (choiceQuestion.isNew) {
			$scope.addChoiceQuestion(choiceQuestion);
			return false;
		}
		$scope.changeChoiceQuestion(choiceQuestion);
	};

	$scope.addChoiceQuestion = function (choiceQuestion) {
		let optionsJson = JSON.stringify(choiceQuestion.choiceOptions);
		//数据保存，并提示保存结果
		$http.post('/knowledge/exercises/choice/add', {
			technologyID: $scope.model.technologyID,
			knowledgeID: $scope.model.knowledgeID,
			exercisesTitle: choiceQuestion.exercisesTitle,
			exercisesSource: choiceQuestion.exercisesSource,
			exercisesType: choiceQuestion.exercisesType,
			choiceOptionsJson: optionsJson,
			loginUser: $scope.model.loginUser.adminID
		}).then(function successCallback(response) {
			if (response.data.err) {
				bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
				return false;
			}

			let currentTime = new Date().toLocaleString('chinese', { hour12: false });
			choiceQuestion.isNew = false;
			choiceQuestion.exercisesID = response.data.exercisesID;
			choiceQuestion.dataStatus = 'P';
			choiceQuestion.dataStatusText = '待审批';
			choiceQuestion.createUser = $scope.model.loginUser.adminName;
			choiceQuestion.createTime = currentTime.replaceAll('/', '-');
			choiceQuestion.updateUser = $scope.model.loginUser.adminName;
			choiceQuestion.updateTime = currentTime.replaceAll('/', '-');

			//隐藏编辑区
			$scope.toggleChoiceQuestionEdit(choiceQuestion, false);
			layer.msg('保存成功！');
		}, function errorCallback(response) {
			bootbox.alert(localMessage.NETWORK_ERROR);
		});
	};

	$scope.changeChoiceQuestion = function (choiceQuestion) {
		choiceQuestion.choiceOptions.forEach((option) => {
			if (option['selectedAnswer'] !== undefined) {
				delete option.selectedAnswer;
			}
		})

		let optionsJson = JSON.stringify(choiceQuestion.choiceOptions);
		//数据保存，并提示保存结果
		$http.put('/knowledge/exercises/choice/change', {
			exercisesID: choiceQuestion.exercisesID,
			technologyID: $scope.model.technologyID,
			knowledgeID: $scope.model.knowledgeID,
			exercisesTitle: choiceQuestion.exercisesTitle,
			exercisesSource: choiceQuestion.exercisesSource,
			exercisesType: choiceQuestion.exercisesType,
			choiceOptionsJson: optionsJson,
			loginUser: $scope.model.loginUser.adminID
		}).then(function successCallback(response) {
			if (response.data.err) {
				bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
				return false;
			}
			let currentTime = new Date().toLocaleString('chinese', { hour12: false });
			choiceQuestion.isNew = false;
			choiceQuestion.updateUser = $scope.model.loginUser.adminName;
			choiceQuestion.updateTime = currentTime.replaceAll('/', '-');
			//隐藏编辑区
			$scope.toggleChoiceQuestionEdit(choiceQuestion, false);
			layer.msg('保存成功！');
		}, function errorCallback(response) {
			bootbox.alert(localMessage.NETWORK_ERROR);
		});
	};

	$scope.onRemoveChoiceQuestion = function (question) {
		if (question.isNew && question.exercisesTitle.length === 0) {
			$scope.removeChoiceQuestion(question);
			return false;
		}
		bootbox.confirm({
			message: `您确定要删除选择题【${question.exercisesTitle}】吗？`,
			buttons: {
				confirm: {
					label: '删除',
					className: 'btn-danger'
				},
				cancel: {
					label: '取消',
					className: 'btn-secondary'
				}
			},
			callback: function (result) {
				if (result) {
					if (question.isNew) {
						$scope.removeChoiceQuestion(question);
						$scope.$apply();
						return false;
					}
					$scope.deleteChoiceQuestion(question);
				}
			}
		});
	};

	$scope.deleteChoiceQuestion = function (question) {
		$http.delete('/knowledge/exercises/choice/delete'
			.concat(`?technologyID=${question.technologyID}`)
			.concat(`&knowledgeID=${question.knowledgeID}`)
			.concat(`&exercisesID=${question.exercisesID}`))
			.then(function successCallback(response) {
				if (response.data.err) {
					bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
					return false;
				}
				$scope.removeChoiceQuestion(question);
				layer.msg('删除成功！');
			}, function errorCallback(response) {
				bootbox.alert(localMessage.NETWORK_ERROR);
			});
	};

	$scope.removeChoiceQuestion = function (question) {
		let removeIndex = -1;
		$scope.model.choiceQuestion.dataList.forEach(function (choiceQuestion, index) {
			if (choiceQuestion === question) {
				removeIndex = index;
			}
		});
		if (removeIndex >= 0) {
			$scope.model.choiceQuestion.dataList.splice(removeIndex, 1);
		}
	}

	$scope.onRemoveOption = function (choiceQuestion, op) {
		let removeIndex = -1;
		choiceQuestion.choiceOptions.forEach(function (option, index) {
			if (option === op) {
				removeIndex = index;
			}
		});
		if (removeIndex >= 0) {
			choiceQuestion.choiceOptions.splice(removeIndex, 1);
		}
	};

	$scope.onCreateChoiceOption = function (choiceQuestion) {
		choiceQuestion.choiceOptions.push({
			optionText: '',
			rightAnswer: false
		});
	};

	$scope.onSetAnswer = function (choiceQuestion, option, event) {
		if (choiceQuestion.exercisesType === 'S') {
			choiceQuestion.choiceOptions.forEach(function (option) {
				option.rightAnswer = false;
			});
		}
		option.rightAnswer = event.target.checked;
	};

	$scope.onLoadMoreChoiceQuestion = function () {
		$scope.model.choiceQuestion.pageNumber++;
		$scope.loadChoiceQuestionList();
	}

	//#endregion

	//#region 填空题

	$scope.onFilterBlankQuestion = function (dataStatus) {
		if ($scope.model.fillInBlankQuestion.dataStatus === dataStatus) {
			return false;
		}
		$scope.model.fillInBlankQuestion.dataStatus = dataStatus;
		$scope.model.fillInBlankQuestion.pageNumber = 1;
		$scope.model.fillInBlankQuestion.dataList = [];
		$scope.loadFillInBlankQuestionList();
	};

	$scope.onLoadMoreBlankQuestion = function () {
		$scope.model.fillInBlankQuestion.pageNumber++;
		$scope.loadFillInBlankQuestionList();
	};

	$scope.loadFillInBlankQuestionList = function () {
		//取得当前知识点的填空题
		$http.get('/knowledge/exercises/blank/list?'
			.concat(`pageNumber=${$scope.model.fillInBlankQuestion.pageNumber}`)
			.concat(`&technologyID=${$scope.model.technologyID}`)
			.concat(`&knowledgeID=${$scope.model.knowledgeID}`)
			.concat(`&dataStatus=${$scope.model.fillInBlankQuestion.dataStatus}`))
			.then(function successCallback(response) {
				if (response.data.err) {
					bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
					return false;
				}

				$scope.model.fillInBlankQuestion.totalCount = response.data.dataContent.totalCount;
				$scope.model.fillInBlankQuestion.maxPageNumber = Math.ceil(response.data.dataContent.totalCount / response.data.dataContent.pageSize);

				if (response.data.dataContent.totalCount > 0) {
					response.data.dataContent.dataList.forEach((data) => {
						data.isNew = false;
						data.isShowEdit = false;
						$scope.model.fillInBlankQuestion.dataList.push(data);
					});
					return false;
				}
				$scope.model.fillInBlankQuestion.dataList = [];
			}, function errorCallback(response) {
				bootbox.alert(localMessage.NETWORK_ERROR);
			});
	};

	$scope.buildFillInBlankQuestion = function () {
		let question = {};
		question.exercisesTitle = '';
		question.exercisesSource = '';
		question.rightAnswer = '';
		question.isNew = true;
		question.isShowEdit = false;
		return question;
	};


	$scope.onCreateFillInQuestion = function () {
		$scope.model.fillInBlankQuestion.dataList.push($scope.buildFillInBlankQuestion());
	};

	$scope.toggleFillInQuestionEdit = function (question, isShow) {
		question.isShowEdit = isShow;
	};

	$scope.checkBlankQuestion = function (question) {
		if (question.exercisesTitle.length === 0) {
			layer.msg('请填写题目标题！');
			return false;
		};
		if (question.exercisesSource.length === 0) {
			layer.msg('请填写题目来源！');
			return false;
		};
		if (question.rightAnswer.length === 0) {
			layer.msg('请填写正确答案！');
			return false;
		};
		return true;
	};

	$scope.addFillInQuestion = function (question) {
		$http.post('/knowledge/exercises/blank/add', {
			technologyID: $scope.model.technologyID,
			knowledgeID: $scope.model.knowledgeID,
			exercisesTitle: question.exercisesTitle,
			exercisesSource: question.exercisesSource,
			rightAnswer: question.rightAnswer,
			loginUser: $scope.model.loginUser.adminID
		}).then(function successCallback(response) {
			if (response.data.err) {
				bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
				return false;
			}
			//隐藏编辑区
			let currentTime = new Date().toLocaleString('chinese', { hour12: false });
			question.isNew = false;
			question.exercisesID = response.data.exercisesID;
			question.dataStatus = 'P';
			question.dataStatusText = '待审批';
			question.createUser = $scope.model.loginUser.adminName;
			question.createTime = currentTime.replaceAll('/', '-');
			question.updateUser = $scope.model.loginUser.adminName;
			question.updateTime = currentTime.replaceAll('/', '-');

			$scope.toggleFillInQuestionEdit(question, false);
			layer.msg('保存成功！');
		}, function errorCallback(response) {
			bootbox.alert(localMessage.NETWORK_ERROR);
		});
	}

	$scope.changeFillInQuestion = function (question) {
		$http.put('/knowledge/exercises/blank/change', {
			exercisesID: question.exercisesID,
			technologyID: $scope.model.technologyID,
			knowledgeID: $scope.model.knowledgeID,
			exercisesTitle: question.exercisesTitle,
			exercisesSource: question.exercisesSource,
			rightAnswer: question.rightAnswer,
			loginUser: $scope.model.loginUser.adminID
		}).then(function successCallback(response) {
			if (response.data.err) {
				bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
				return false;
			}
			let currentTime = new Date().toLocaleString('chinese', { hour12: false });
			question.isNew = false;
			question.updateUser = $scope.model.loginUser.adminName;
			question.updateTime = currentTime.replaceAll('/', '-');
			//隐藏编辑区
			$scope.toggleFillInQuestionEdit(question, false);
			layer.msg('保存成功！');
		}, function errorCallback(response) {
			bootbox.alert(localMessage.NETWORK_ERROR);
		});
	}

	$scope.saveFillInQuestion = function (question) {
		if (!$scope.checkBlankQuestion(question)) {
			return false;
		}

		if (question.isNew) {
			$scope.addFillInQuestion(question);
			return false;
		}
		$scope.changeFillInQuestion(question);
	}

	$scope.changeBlankStatus = function () {
		if ($scope.model.question.dataStatus === $scope.model.approveExercises.status) {
			layer.msg('修改的状态不能和当前状态相同！');
			return false;
		}
		$http.put('/knowledge/exercises/blank/change/status', {
			exercisesID: $scope.model.question.exercisesID,
			technologyID: $scope.model.technologyID,
			knowledgeID: $scope.model.knowledgeID,
			dataStatus: $scope.model.approveExercises.status,
			loginUser: $scope.model.loginUser.adminID
		}).then(function successCallback(response) {
			if (response.data.err) {
				bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
				return false;
			}
			let currentTime = new Date().toLocaleString('chinese', { hour12: false });
			$scope.model.question.dataStatus = $scope.model.approveExercises.status;
			$scope.model.question.dataStatusText = $scope.model.approveExercises.status === 'A' ? '审批通过' : '审批未通过';
			$scope.model.question.updateUser = $scope.model.loginUser.adminName;
			$scope.model.question.updateTime = currentTime.replaceAll('/', '-');

			if ($scope.model.fillInBlankQuestion.dataStatus === 'NULL') {
				$('#kt_modal_status').modal('hide');
				return false;
			}

			$scope.removeFillInQuestion($scope.model.question);
			$('#kt_modal_status').modal('hide');

		}, function errorCallback(response) {
			bootbox.alert(localMessage.NETWORK_ERROR);
		});
	};

	$scope.onRemoveFillInQuestion = function (question) {
		if (question.isNew && question.exercisesTitle.length === 0) {
			$scope.removeFillInQuestion(question);
			return false;
		}
		bootbox.confirm({
			message: `您确定要删除填空题【${question.exercisesTitle}】吗？`,
			buttons: {
				confirm: {
					label: '删除',
					className: 'btn-danger'
				},
				cancel: {
					label: '取消',
					className: 'btn-secondary'
				}
			},
			callback: function (result) {
				if (result) {
					if (question.isNew) {
						$scope.removeFillInQuestion(question);
						$scope.$apply();
						return false;
					}
					$scope.deleteBlankQuestion(question);
				}
			}
		});
	};

	$scope.deleteBlankQuestion = function (question) {
		$http.delete('/knowledge/exercises/blank/delete'
			.concat(`?technologyID=${question.technologyID}`)
			.concat(`&knowledgeID=${question.knowledgeID}`)
			.concat(`&exercisesID=${question.exercisesID}`))
			.then(function successCallback(response) {
				if (response.data.err) {
					bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
					return false;
				}
				$scope.removeFillInQuestion(question);
				layer.msg('删除成功！');
			}, function errorCallback(response) {
				bootbox.alert(localMessage.NETWORK_ERROR);
			});
	};

	$scope.removeFillInQuestion = function (question) {
		let removeIndex = -1;
		$scope.model.fillInBlankQuestion.dataList.forEach(function (fillInQuestion, index) {
			if (fillInQuestion === question) {
				removeIndex = index;
			}
		});
		if (removeIndex >= 0) {
			$scope.model.fillInBlankQuestion.dataList.splice(removeIndex, 1);
		}
	}

	//#endregion

	//#region 编程题
	$scope.initUploadPlugin = function () {
		let uploadDocumentDir = { "dir1": "exercises", "dir2": `T${$scope.model.technologyID}`, "dir3": `K${$scope.model.knowledgeID}` };
		let uploadDocumentServerUrl = commonUtility.buildSystemRemoteUri(Constants.UPLOAD_SERVICE_URI, uploadDocumentDir);
		uploadUtils.initUploadPlugin('#file-upload-document', uploadDocumentServerUrl, ['pdf'], false, function (opt, data) {
			$scope.model.programmeQuestion.documentUrl = data.fileUrlList[0];
			$scope.$apply();
			layer.msg(localMessage.UPLOAD_SUCCESS);
		});
	};

	$scope.onChangeDocumentList = function () {
		$scope.model.programmeQuestion.dataList.push({
			documentUrl: $scope.model.programmeQuestion.documentUrl,
			documentName: $scope.model.programmeQuestion.documentUrl.substr($scope.model.programmeQuestion.documentUrl.lastIndexOf('/') + 1),
			answerGitUrl: $scope.model.programmeQuestion.answerGitUrl,
		});
		$('#kt_modal_document').modal('hide');
	};

	$scope.loadFileList = function () {
		$http.get(`/knowledge/exercises/program/files?technologyID=${$scope.model.technologyID}&knowledgeID=${$scope.model.knowledgeID}`).then(function successCallback(response) {
			if (response.data.err) {
				bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
				return false;
			}
			if (response.data.files === null) {
				$scope.model.programmeQuestion.totalCount = 0;
				return false;
			}

			$scope.model.programmeQuestion.dataList.splice(0, response.data.files.length);
			if (response.data.files !== null) {
				response.data.files.forEach(function (file) {
					$scope.model.programmeQuestion.dataList.push({
						documentUrl: file.documentUrl,
						documentName: file.documentUrl.substr(file.documentUrl.lastIndexOf('/') + 1),
						answerGitUrl: file.answerUrl,
						dataStatus: file.dataStatus,
						dataStatusText: file.dataStatusText,
						createUser: file.createUser,
						createTime: file.createTime
					});
				})
			}
			$scope.model.programmeQuestion.totalCount = $scope.model.programmeQuestion.dataList.length;
		}, function errorCallback(response) {
			bootbox.alert(localMessage.NETWORK_ERROR);
		});
	};

	$scope.onShowUploadDocumentModal = function () {
		$('div.cleanFileBt').trigger("click");
		$scope.model.programmeQuestion.answerGitUrl = '';
		$scope.model.programmeQuestion.documentUrl = '';
		$('#kt_modal_document').modal('show');
	};

	$scope.onRemoveDocument = function (data) {
		$scope.model.programmeQuestion.dataList.forEach(function (image, index) {
			if (image.documentUrl === data.documentUrl) {
				$scope.model.programmeQuestion.dataList.splice(index, 1);
			}
		})
	};

	$scope.onSave = function () {
		let documentObjectArray = [];

		$scope.model.programmeQuestion.dataList.forEach(function (document) {
			documentObjectArray.push({
				documentUrl: document.documentUrl,
				answerUrl: document.answerGitUrl
			});
		});
		$http.post('/knowledge/exercises/program/add', {
			technologyID: $scope.model.technologyID,
			learningPhaseID: $scope.model.learningPhaseID,
			knowledgeID: $scope.model.knowledgeID,
			exercisesJson: JSON.stringify(documentObjectArray),
			loginUser: $scope.model.loginUser.adminID
		}).then(function successCallback(response) {
			if (response.data.err) {
				bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
				return false;
			}
			$scope.loadFileList();
			layer.msg(localMessage.UPLOAD_SUCCESS);
		}, function errorCallback(response) {
			bootbox.alert(localMessage.NETWORK_ERROR);
		});
	};

	//#endregion

	//#region 页面初始化
	$scope.initPage = function () {
		commonUtility.setNavActive();
		if (!$scope.getParameter()) {
			bootbox.alert(localMessage.PARAMETER_ERROR);
			return false;
		}
		$scope.loadChoiceQuestionList();
		$scope.loadFillInBlankQuestionList();
		$scope.initUploadPlugin();
		$scope.loadFileList();
	};

	$scope.getParameter = function () {
		let parameterJson = localStorage.getItem(Constants.KEY_UPLOAD_EXERCISES);
		if (parameterJson === null) {
			return false;
		}

		let parameter = JSON.parse(parameterJson);
		$scope.model.technologyID = parameter.technologyID;
		$scope.model.technologyName = parameter.technologyName;
		$scope.model.learningPhaseID = parameter.learningPhaseID;
		$scope.model.learningPhaseName = parameter.learningPhaseName;
		$scope.model.knowledgeID = parameter.knowledgeID;
		$scope.model.knowledgeName = parameter.knowledgeName;
		return true;
	};

	//#endregion

	$scope.initPage();
});

angular.bootstrap(document.querySelector('[ng-app="pageApp"]'), ['pageApp']);
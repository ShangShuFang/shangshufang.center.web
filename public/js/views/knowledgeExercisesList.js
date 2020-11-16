let pageApp = angular.module('pageApp', []);
pageApp.controller('pageCtrl', function ($scope, $http) {
  $scope.filterModel = {
		technologyList: [],
		selectedTechnology: {technologyID: 0, technologyName: '全部技术'},

		universityList: [],
		selectedUniversity: {universityCode: 0, universityName: '全部高校'},

		courseList: [],
		selectedCourse: {courseID: 0, courseName: '全部课程'},

		statusList: [],
		selectedStatus: {statusCode: 'NULL', statusName: '全部状态'}
	};
	$scope.dataModel = {
    fromIndex : 0,
    toIndex: 0,
    pageNumber: 1,
    totalCount: 0,
    maxPageNumber: 0,
    dataList: [],
    paginationArray: [],
    prePageNum: -1,
    nextPageNum: -1
  };

  //#region 页面初始化
  $scope.initPage = function () {
		commonUtility.setNavActive();
		$scope.loadFilter();
		$scope.loadData();
  };

	$scope.loadFilter = function () {
		$scope.loadStatusFilter();
		$scope.loadTechnologyFilter();
		$scope.loadUniversityFilter();
	};

	$scope.loadTechnologyFilter = function () {
		$http.get('/common/technology').then(function successCallback(response) {
			if (response.data.err) {
					bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
					return false;
			}
			if (response.data.dataList === null) {
					return false;
			}
			$scope.filterModel.technologyList = response.data.dataList;
	}, function errorCallback(response) {
			bootbox.alert(localMessage.NETWORK_ERROR);
	});
	};

	$scope.loadUniversityFilter = function () {
		$http.get('/common/university').then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
      if(response.data.dataList === null){
        return false;
      }
			$scope.filterModel.universityList = response.data.dataList;
			
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
	};

	$scope.loadStatusFilter = function () {
		$scope.filterModel.statusList.push({statusCode: 'P', statusName: '待提交'});
		$scope.filterModel.statusList.push({statusCode: 'C', statusName: '待批改'});
		$scope.filterModel.statusList.push({statusCode: 'R', statusName: '待修改'});
		$scope.filterModel.statusList.push({statusCode: 'S', statusName: '检查通过'});
	};

	$scope.loadData = function(){
		let pageNumber = $scope.dataModel.pageNumber;
		let technologyID = $scope.filterModel.selectedTechnology.technologyID;
		let universityCode = $scope.filterModel.selectedUniversity.universityCode;
		let courseID = $scope.filterModel.selectedCourse.courseID;
		let dataStatus = $scope.filterModel.selectedStatus.statusCode;
		$http.get('/knowledge/exercises/list/dataList'
				.concat(`?pageNumber=${pageNumber}`)
				.concat(`&dataStatus=${dataStatus}`)
				.concat(`&technologyID=${technologyID}`)
				.concat(`&universityCode=${universityCode}`)
				.concat(`&courseID=${courseID}`))
        .then(function successCallback (response) {
          if(response.data.err){
            bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
            return false;
          }
          $scope.dataModel.totalCount = response.data.dataContent.totalCount;
          $scope.dataModel.dataList = response.data.dataContent.dataList;
          $scope.dataModel.pageNumber = parseInt(response.data.dataContent.currentPageNum);
          $scope.dataModel.maxPageNumber = Math.ceil(response.data.dataContent.totalCount / response.data.dataContent.pageSize);
          $scope.dataModel.paginationArray = response.data.dataContent.paginationArray;
          $scope.dataModel.prePageNum = response.data.dataContent.prePageNum === undefined ? -1 : response.data.dataContent.prePageNum;
          $scope.dataModel.nextPageNum = response.data.dataContent.nextPageNum === undefined ? -1 : response.data.dataContent.nextPageNum;
          $scope.dataModel.fromIndex = response.data.dataContent.dataList === null ? 0 : (parseInt(response.data.dataContent.currentPageNum) - 1) * response.data.dataContent.pageSize + 1;
          $scope.dataModel.toIndex = response.data.dataContent.dataList === null ? 0 : (parseInt(response.data.dataContent.currentPageNum) - 1) * response.data.dataContent.pageSize + response.data.dataContent.totalCount;
        }, function errorCallback(response) {
          bootbox.alert(localMessage.NETWORK_ERROR);
        });
  };
	//#endregion

	//#region 数据筛选
	$scope.loadCourseFilter = function () {
		let technologyID = $scope.filterModel.selectedTechnology.technologyID;
		let universityCode = $scope.filterModel.selectedUniversity.universityCode;
		let schoolID = 0;
		let teacherID = 0;
		if (technologyID === 0 || universityCode === 0) {
			$scope.clearCourseFilter();
			return false;
		}
		$http.get('/common/course'
		.concat(`?universityCode=${universityCode}`)
		.concat(`&schoolID=${schoolID}`)
		.concat(`&teacherID=${teacherID}`)
		.concat(`&technologyID=${technologyID}`)).then(function successCallback (response) {
      if(response.data.err){
        bootbox.alert(localMessage.formatMessage(response.data.code, response.data.msg));
        return false;
      }
			$scope.filterModel.courseList = response.data.dataList;
    }, function errorCallback(response) {
      bootbox.alert(localMessage.NETWORK_ERROR);
    });
	};

	$scope.clearCourseFilter = function () {
		$scope.filterModel.courseList = [];
		$scope.filterModel.selectedCourse = {courseID: 0, courseName: '全部课程'};
	};

	$scope.onStatusFilterChange = function (code, name) {
		if ($scope.filterModel.selectedStatus.statusCode === code) {
			return false;
		}
		$scope.filterModel.selectedStatus = {statusCode: code, statusName: name};
		$scope.loadData();
	};

	$scope.onTechnologyFilterChange = function (technologyID, technologyName) {
		if ($scope.filterModel.selectedTechnology.technologyID === technologyID) {
			return false;
		}
		$scope.filterModel.selectedTechnology = {technologyID: technologyID, technologyName: technologyName};
		$scope.loadCourseFilter();
		$scope.loadData();
	};

	$scope.onUniversityFilterChange = function (universityCode, universityName) {
		if ($scope.filterModel.selectedUniversity.universityCode === universityCode) {
			return false;
		}
		$scope.filterModel.selectedUniversity = {universityCode: universityCode, universityName: universityName};
		$scope.loadCourseFilter();
		$scope.loadData();
	};

	$scope.onCourseFilterChange = function (courseID, courseName) {
		if ($scope.filterModel.selectedCourse.courseID === courseID) {
			return false;
		}
		$scope.filterModel.selectedCourse = {courseID: courseID, courseName: courseName};
		$scope.loadData();
	}
	//#endregion

	//#region 数据翻页
  $scope.onPrePage = function(){
    if($scope.dataModel.pageNumber === 1){
      return false;
    }
    $scope.dataModel.pageNumber--;
    $scope.loadData();
  };

  $scope.onPagination = function(pageNumber){
    if($scope.dataModel.pageNumber === pageNumber){
      return false;
    }
    $scope.dataModel.pageNumber = pageNumber;
    $scope.loadData();
  };

  $scope.onNextPage = function(){
    if($scope.dataModel.pageNumber === $scope.dataModel.maxPageNumber){
      return false;
    }
    $scope.dataModel.pageNumber++;
    $scope.loadData();
	};
	//#endregion
	
	//#region 数据操作
	$scope.onOpenDetail = function (courseExercisesID) {
		location.href = `/knowledge/exercises/detail?courseExercisesID=${courseExercisesID}`;
	}
	//#endregion
  $scope.initPage();
});

angular.bootstrap(document.querySelector('[ng-app="pageApp"]'), ['pageApp']);
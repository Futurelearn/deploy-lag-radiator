$(document).ready(function() {
  var repo_name = getQueryVariable('repo');
  var refresh_rate = (getQueryVariable('refresh') || 60) * 1000;
  var reload_page_rate = getQueryVariable('reload_page_rate') || 10;
  var api_token = getQueryVariable('token');
  var repo_owner = getQueryVariable('owner') || 'futurelearn';
  var refreshes = 0;
  var container = $('#container');


  var repo = {
    path: repo_owner + '/' + repo_name,
    name: repo_name
  }

  var compareAPIPath = function(from, to) {
    return '/repos/' + repo.path + '/compare/' + from + '...' + to
  }

  var statusAPIPath = '/repos/' + repo.path + '/commits/master/status'

  var pullRequestsAPIPath = '/repos/' + repo.path + '/pulls'

  var updatebuildStatus = function(repo_status) {
    $('.build .stat').text(repo_status.state)
    $('.build').attr('class', 'box build '+ repo_status.state)
  }

  var githubAPICall = function(path, callback) {
    $.ajax({
      url: "https://api.github.com" + path,
      dataType: 'json',
      success: callback,
      error: function(e) {
        console.log(e)
      },
      headers: {
        'Authorization': 'token ' + api_token
      }
    });
  }

  var updateDeployStatus = function(repo_state, $element, from_name) {
    if (repo_state.ahead_by == 0) {
      $element.find('.stat').text('up to date')
      $element.find('.detail').text('')
    } else if (repo_state.ahead_by == 1) {
      $element.find('.stat').text('1')
      $element.find('.detail').text('commit behind ' + from_name)
    } else {
      $element.find('.stat').text(repo_state.ahead_by)
      $element.find('.detail').text('commits behind ' + from_name)
    }
    $element.removeClass('good bad meh');
    if (repo_state.ahead_by == 0) {
      $element.addClass('good')
    } else if (repo_state.ahead_by > 10) {
      $element.addClass('bad')
    } else {
      $element.addClass('meh')
    }

    updateLatestCommitInfo(repo_state, $element);
  }

  var updateStagingStatus = function(repo_state) {
    updateDeployStatus(repo_state, $('.staging-deploys'), 'master-build-passed')
  }

  var updateProductionStatus = function(repo_state) {
    updateDeployStatus(repo_state, $('.production-deploys'), 'current-staging')
  }

  var updatePullReqestsStatus = function(pull_requests) {
    $('.pull-requests .stat').text(pull_requests.length)
  }

  var updateTime = function() {
    var time = new Date();

    date = time.getDate()
    month = time.getMonth() + 1
    hours = time.getHours()
    minutes = time.getMinutes()

    if (date < 10) { date = '0' + date }
    if (month < 10) { month = '0' + month }
    if (hours < 10) { hours = '0' + hours }
    if (minutes < 10) { minutes = '0' + minutes }

    var lastUpdated = 'updated at ' + time.getFullYear() + '-' + month + '-' + date
      + ' ' + hours + ':' + minutes

    $('.updated-at').text(lastUpdated)
  }
  var update = function(repo, refresh_rate) {
    githubAPICall(compareAPIPath('current-staging', 'master-build-passed'), updateStagingStatus)
    githubAPICall(compareAPIPath('current-production', 'current-staging'), updateProductionStatus)
    githubAPICall(statusAPIPath, updatebuildStatus)
    githubAPICall(pullRequestsAPIPath, updatePullReqestsStatus)
    updateTime()

    if (refresh_rate) {
      setTimeout(function() {
        if (refreshes == reload_page_rate ) {
          refreshes = 0;
          window.location.reload(true);
        } else {
          refreshes = refreshes + 1;
          update(repo, refresh_rate);
        }
      }, refresh_rate);
    }
  }

  var shortenSha = function(full_sha) {
    return full_sha.substr(0,7);
  }

  var updateLatestCommitInfo = function(repo_state, $element) {
    var baseCommit = repo_state.base_commit;
    var latestCommitAuthor = baseCommit.committer.login;
    var latestCommitSha = shortenSha(baseCommit.sha);

    $element.find('.commit-sha').text(latestCommitSha);
    $element.find('.commit-author').text(latestCommitAuthor);
  }

  update(repo, refresh_rate);
});

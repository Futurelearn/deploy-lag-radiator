$(document).ready(function() {
  var repo_name = getQueryVariable('repo');
  var refresh_rate = (getQueryVariable('refresh') || 60) * 1000;
  var from_tag = getQueryVariable('from');
  var to_tag = getQueryVariable('to') || 'master';
  var api_token = getQueryVariable('token');
  var repo_owner = getQueryVariable('owner') || 'futurelearn';

  var container = $('#container');

  var compareAPIPath = function(from_tag, to_tag) {
    return '/repos/' + repo.path + '/compare/' + from_tag + '...' + to_tag
  }

  var repo = {
    path: repo_owner + '/' + repo_name,
    name: repo_name
  }

  var initialise = function(repo) {
    var $repo = $('<tr>').attr('class', 'repo-' + repo)
      .append('<td class="commits">')
      .append($('<td class="environment">').text(from_tag))
      .append('<td class="time">');

    container.append($repo);
    repo.$el = $repo;
  }

  var updateCommitStatus = function(repo_state){
    repo.$el.find('.commits').text(repo_state.ahead_by || '✔');
    repo.$el.addClass(repo_state.ahead_by ? 'stale' : 'good');
    var mergeCommits = repo_state.commits.filter(function(commit) {
      return commit.parents.length > 1}
    );

    if (repo_state.commits.length) {
      repo.$el.find('.time').text(prettyDate(repo_state.commits[0].commit.author.date));
    }
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

  var update = function(repo, refresh_rate) {
    path = compareAPIPath(from_tag, to_tag);
    githubAPICall(path, updateCommitStatus)

    if (refresh_rate) {
      setTimeout(function() {
        update(repo, refresh_rate);
      }, refresh_rate);
    }
  }

  initialise(repo);
  update(repo, refresh_rate);

});

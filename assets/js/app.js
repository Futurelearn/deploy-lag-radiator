$(document).ready(function() {
  var repo_name = getQueryVariable('repo');
  var refresh_rate = (getQueryVariable('refresh') || 60) * 1000;
  var from_tag = getQueryVariable('from');
  var to_tag = getQueryVariable('to') || 'master';
  var api_token = getQueryVariable('token');
  var repo_owner = getQueryVariable('owner') || 'alphagov';

  var container = $('#container');

  var build_api_url = function(repo, from_tag, to_tag) {
    return 'https://api.github.com/repos/' + repo + '/compare/' + from_tag + '...' + to_tag
  }

  var build_http_compare_url = function(repo, from_tag, to_tag) {
    return 'https://github.com/' + repo + '/compare/' + from_tag + '...' + to_tag
  }

  var repo = {
    path: repo_owner + '/' + repo_name,
    name: repo_name
  }


  var initialise = function(repo) {
    var $repo = $('<tr>').attr('class', 'repo-' + repo)
      .append('<td class="commits">')
      .append($('<td class="environment">').append($('<a>').attr('href', build_http_compare_url(repo.path, from_tag, to_tag)).text(from_tag)))
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

  var update = function(repo, refresh_rate) {
    api_url = build_api_url(repo.path, from_tag, to_tag);
    $.ajax({
      url: api_url,
      dataType: 'json',
      success: updateCommitStatus,
      error: function(e) {
        // Most likely invalid comparison, one (or both) of the tags don't exist
        // Or the repo name is bad
        repo.$el.addClass('unknown');

        if (e.status == 404) {
          repo.$el.find('.commits').text('?');
        }
      },
      headers: {
        'Authorization': 'token ' + api_token
      }
    });

    if (refresh_rate) {
      setTimeout(function() {
        update(repo, refresh_rate);
      }, refresh_rate);
    }
  }

  initialise(repo);
  update(repo, refresh_rate);

});

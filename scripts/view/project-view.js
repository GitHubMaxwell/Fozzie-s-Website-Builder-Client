'use strict';
/*
land on this page AFTER sign up or log in
retrieve there project data from the DB
get the name of the projects
make individual LI from them
*/
var app = app || {};
(function (module) {

  var projectView = {};

  projectView.initProjectView = function (ctx) {
    $('section').hide();
    $('#project-view ul').empty();
    $('#project-view').show();
    $('#section-list').hide();

    $.get(`${ENV.apiUrl}/user/projects/${ctx.params.user_id}`)
      .then(result => {
        if(result.length){
          let template = Handlebars.compile($('#project-li-template').text());
          for (var i in result){
            $('#project-view ul').append(template(result[i]));
          }
        }
        let template = Handlebars.compile($('#add-new-project-li').text());
        $('#project-view ul').append(template(ctx.params));
      })
      .then(()=> {
        $('.download-project').on('click', projectView.downloadProject);
        $('.edit-project').on('click', projectView.editProjectName); 
        $('.delete-project').on('click', projectView.deleteProject);
        $('li.add-new-project').on('click', projectView.addNewProject);
      });
  };

  projectView.downloadProject = function() {
    let projectid = $(this).parent().data('projectid');
    console.log(projectid);
    new JSZip.external.Promise(function (resolve, reject) {
      JSZipUtils.getBinaryContent(`${ENV.apiUrl}/app/zip/${projectid}`, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }).then(function (data) {
      console.log('"data" from server: ', data);
      return JSZip.loadAsync(data, { createFolders: true });
    })
      .then(results => console.log(results))
      .catch(console.error);
  };

  projectView.editProjectName = function() {
    let projectid = $(this).parent().data('projectid');
    let projectName = $(this).parent().find('a').text();
    console.log(projectid);
    $(this).parent().append($('<input>').val(projectName));

    $('input').on('change', function (event) {
      let newProjectName = $(this).val();

      $.ajax({
        url: `${ENV.apiUrl}/app/project/${projectid}`,
        method: 'PUT',
        data: {
          project_name: newProjectName
        }
      })
        .then(function () {
          page(`/projects/${app.user.user_id}`)
        })
        .catch(console.error);
    });
  };

  projectView.deleteProject = function() {
    let projectid = $(this).parent().data('projectid');

    $.ajax({
      url: `${ENV.apiUrl}/app/user/projects/delete/${projectid}`,
      method: 'DELETE'
    })
      .then(function() {
        page(`/projects/${app.user.user_id}`)
      })
      .catch(console.error);
  };

  projectView.addNewProject = function() {
    $(this).parent().append($('<input>').val('Project Name Hear')); 

    $('input').on('change', function (event) {
      let projectName = $(this).val();

      $.ajax({
        url: `${ENV.apiUrl}/app/project/new/${projectName}`,
        method: 'POST',
        data: {
          user_id: app.user.user_id
        }
      })
      .then(function() {
        page(`/projects/${app.user.user_id}`)
      })
      .catch(console.error);
    });
  };

  // downloadProject = function() {
  //   new JSZip.external.Promise(function (resolve, reject) {
  //     JSZipUtils.getBinaryContent(`${ENV.apiUrl}/app/zip/${projectId}`, function (err, data) {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve(data);
  //       }
  //     });
  //   }).then(function (data) {
  //     return JSZip.loadAsync(data);
  //   })
  //     .then(results=> console.log(results))
  //     .catch(console.error);
  // }


  // };
  module.projectView = projectView;
})(app);

//     page('/projects');
//how to get the user data from the DB and populate the project-view interface with new li per project name
//let template = Handlebars.compile($('#book-detail-template').text());
// $('.book-detail').append(template(ctx.book));
// to UPDATE the project BUT ONLY the name of it
// $('#update-btn').on('click', function() {
//   page(`/books/${$(this).data('id')}/update`);
// });
// to DELETE the project from the project view and all contents of it from DB
// $('#delete-btn').on('click', function() {
//   module.Project.destroy($(this).data('id'));
// });
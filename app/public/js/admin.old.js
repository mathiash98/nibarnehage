function getAndRenderPage(page) {
  var client = new HttpClient();
  client.get(page, true, function (response) {
    console.log(response);
    var res = JSON.parse(response);
    var name = '';
    if(res.data[0].name == 'index'){name = 'Forside';} else {
      name = res.data[0].name;
    }
    document.getElementById('containerData').innerHTML = `
    <div class="container-fluid">
      <h1>${name}</h1>
        <form id="${res.data[0]._id}.form" onSubmit='pageDataPut(event, "${res.data[0]._id}")' >
          <button type="submit" class="btn btn-success">Lagre endringer</button>
          <div class="row" id="pageDataFormRow">

          </div>

        </form>
    </div>
    `;
    if (res.data[0].name == 'om-oss') {
      for (var key in res.data[0].textBoxes) {
        if (!res.data[0].textBoxes.hasOwnProperty(key)) {
          //The current property is not a direct property of p
          continue;
        }
        document.getElementById('pageDataFormRow').innerHTML += `
        <div class="panel panel-default col-xs-12">
        <div class="panel-heading">
        ${key}
        </div>
        <div class="panel-body">
        <textarea name="${key}" rows="16" class="form-control">${res.data[0].textBoxes[key].data}</textarea>
        </div>
        </div>
        `;
      }
    } else {
      for (var key in res.data[0].textBoxes) {
        if (!res.data[0].textBoxes.hasOwnProperty(key)) {
          //The current property is not a direct property of p
          continue;
        }
        document.getElementById('pageDataFormRow').innerHTML += `
        <div class="panel panel-default col-sm-6 col-lg-4">
        <div class="panel-heading">
        ${key}
        </div>
        <div class="panel-body">
        <textarea name="${key}" rows="8" class="form-control">${res.data[0].textBoxes[key].data}</textarea>
        </div>
        </div>
        `;
      }
    }
  });
}

function getAndRenderInnlegg(page) {
  // TODO: FIX back tick together with double and single quotes
  document.getElementById('containerData').innerHTML =
        `
        <form class="innleggForm" action="/admin/innlegg" method="post" id="nyttInnleggForm" onSubmit='${"innleggPost(event, nyttInnleggNavn.value, nyttInnleggData.value)"}'>
          <div class="panel panel-default">

              <div class="panel-heading">
              <button class="btn btn-success" type="submit">Lagre</button>
                <div class="form-group">
                  <br>
                  <label for="name">Tittel: </label>
                  <input type="text" id="nyttInnleggNavn" class="form-control" name="name" required placeholder="Tittel" value=""/>
                </div>
              </div>

              <div class="panel-body">
                <div class="form-group">
                  <label for="data">Tekst: </label>
                  <textarea type="text" id="nyttInnleggData" rows="6" class="form-control" name="data" form="nyttInnleggForm" required placeholder="Data"></textarea>
                </div>
              </div>
          </div>
        </form>

      <div class="divider"></div>
    `;

    var client = new HttpClient();
    client.get(page, true, function(response) {
        var res = JSON.parse(response);
        console.log(res.data);
        for (var i = 0; i < res.data.length; i++) {
            // #TODO:0 Fix dette
            document.getElementById('containerData').innerHTML += `
              <div class="form">
                <div class="panel panel-default">

                    <div class="panel-heading">
                    <button class="btn btn-danger" onClick='innleggSave(false, "${res.data[i]._id}")'>Slett</button>
                    <button class="btn btn-success" onClick='innleggSave(true, "${res.data[i]._id}")'>Lagre</button>
                      <div class="form-group">
                        <br>
                        <label for="name">Tittel: </label>
                        <input type="text" id="${res.data[i]._id}FormName" class="form-control" name="name" required placeholder="Tittel" value="${res.data[i].name}"/>
                      </div>
                    </div>

                    <div class="panel-body">
                      <div class="form-group">
                        <label for="data">Tekst: </label>
                        <textarea type="text" id="${res.data[i]._id}FormData" rows="6" class="form-control" name="data" required placeholder="Data">${res.data[i].data}</textarea>
                      </div>
                    </div>

                    <div class="panel-footer">
                        <p>DatabaseID: ${res.data[i]._id}</p>
                        <p>Dato: ${convertStringTimeToDate(res.data[i].added)}</p>
                    </div>
                </div>
              </div>
              <div class="divider"></div>
            `;
        }
    });
}

function innleggPost(e, navn, data) {
  console.log('Posted innlegg ' + navn);
  e.preventDefault();
  var tempInnlegg = {
    name:navn,
    data:data
  };
  var oReq = new XMLHttpRequest();
  oReq.onload = ajaxSuccess;
  oReq.open("POST", "/admin/innlegg");
  oReq.setRequestHeader("content-type", "application/json");
  oReq.send(JSON.stringify(tempInnlegg));
}
// sadasd

function innleggSave(method, id) {
  var name = document.getElementById(id+'FormName').value;
  var data = document.getElementById(id+'FormData').value;
  console.log(method,id,name,data);
  var oReq = new XMLHttpRequest();
  oReq.onload = ajaxSuccess;
  if (method == false) {
    oReq.open("DELETE", "/admin/innlegg/"+id);
    oReq.send(null);

  } else if (method == true) {
    var tempInnlegg = {
      _id: id,
      name: name,
      data: data
    };
    oReq.open("PUT", "/admin/innlegg/"+id);
    oReq.setRequestHeader("content-type", "application/json");
    oReq.send(JSON.stringify(tempInnlegg));
  }
}


function pageDataPut(e, pageId) {
  e.preventDefault();
  var client = new HttpClient();
  console.log(e);
  // TODO gjør om til en fornuftig form og les data fra textarea
  var tempTextBoxes = {};
  for (var i = 1; i < e.target.length; i++) {
    if (e.target[i].type == 'textarea') {
      tempTextBoxes[e.target[i].name] = {
        data:e.target[i].value
      };
    } else {
      break;
    }
  }
  client.put('/admin/pagedata/'+pageId, tempTextBoxes, function (response) {
    var res = JSON.parse(response);
    console.log(response);
  });
  // client.put('/admin/pagedata/'+pageId, form, function (res) {
  //   console.log(res);
  // });
}

function getAndRenderAlbums(url) {
    window.location.hash = "#album/";
    var client = new HttpClient();
    client.get(url, true, function(response) {
        var res = JSON.parse(response);
        document.getElementById('containerData').innerHTML = `
        <div class="row">
          <form action="/admin/album" method="post" onSubmit="postAlbum(event, this); return false;" class="form-group col-md-6">
              <input type="file" name="img" multiple required>
              <input class="form-control" type="text" name="name" value="" placeholder="AlbumNavn">
              <textarea class="form-control" type="text" name="description" value="" placeholder="Beskrivelse"></textarea>
              <input type="submit" name="" value="Last opp nytt album">
          </form>
        </div>
        <br>
        <div class="row" id="containerData_AlbumRow"></div>

        `;

        for (var i = 0; i < res.data.length; i++) {
          // Get first image:
          document.getElementById('containerData_AlbumRow').innerHTML += `
          <div class="col-xs-6 col-md-3">
            <div class="thumbnail" onclick='loadAlbumId("${res.data[i]._id}")'>
            <img alt="${res.data[i].name}" id="${res.data[i]._id}Album">
              <div class="caption">
                <h3>${res.data[i].name}</h3>
                <p>${res.data[i].description}</p>
              </div>
            </div>
          </div>
          `;
          new HttpClient().get('/admin/bilde/' + res.data[i].imgs[0]._id, false, function(imgResponse) {
            document.getElementById(res.data[i]._id+'Album').setAttribute('src', "data:image/jpg;base64,"+imgResponse);
          });


        }

    });
}

function postAlbum(e, form) {
  e.preventDefault();
  if (!form.action) {
    console.log('No action');
    return false;
  }
  var oReq = new XMLHttpRequest();
  console.log(new FormData(form));
  oReq.upload.addEventListener("progress", updateProgress);
  oReq.onload = ajaxSuccess;
  oReq.open("post", form.action, true);
  oReq.send(new FormData(form));
}
function putAlbum(e, form, id) {
  e.preventDefault();
  console.log(form.img.value.length);
  console.log(form.img.value);
  console.log(id);
  console.log(form);
  console.log(form.img);
  var oReq = new XMLHttpRequest();
  oReq.upload.addEventListener("progress", updateProgress);
  oReq.onload = ajaxSuccess;
  oReq.open("PUT", "/admin/album/"+id, true);
  if (form.img.value.length > 4) {
    oReq.send(new FormData(form));
  } else {
    var data = new FormData();
    data.append("name", form.name.value);
    data.append("description", form.description.value);
    oReq.send(data);
  }

}
function slettAlbum(id) {
  var oReq = new XMLHttpRequest();
  oReq.onload = ajaxSuccess;
  oReq.open("delete", "/admin/album/"+id, true);
  oReq.send(null);
}
function loadAlbumId(id) {
  window.location.hash = "#album/"+id;
  var client = new HttpClient();
  client.get("/admin/album/"+id, true, function(response) {
    var res = JSON.parse(response);
    document.getElementById('containerData').innerHTML = `
    <button class="btn btn-default" onClick='getAndRenderAlbums("/admin/album")'><span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>Gå tilbake til album.</button>
    <button class="center-text btn btn-danger" onClick='slettAlbum("${res.data._id}")'>Slett album</button>
    <h1 class="center-text">${res.data.name}</h1>
    <p class="center-text">${res.data.description}</p>
    <br>
    <div class="row">
      <form onSubmit="putAlbum(event, this, '${id}')" class="form-group col-md-6">
        <input type="file" name="img" multiple>
        <input class="form-control" type="text" name="name" value="${res.data.name}" placeholder="AlbumNavn">
        <textarea class="form-control" type="text" name="description" placeholder="Beskrivelse">${res.data.description}</textarea>
        <input type="submit" name="" value="Last opp nye bilder eller endre info">
      </form>
    </div>
    <br>
    `;
    for (var j = 0; j < res.data.imgs.length; j++) {
      new HttpClient().get('/admin/bilde/' + res.data.imgs[j]._id, true, function(image) {
        document.getElementById('containerData').innerHTML += `
        <img  height="300" src="data:image/jpg;base64,${image}">
        `;
      });
    }
  });
}
function convertStringTimeToDate(string) {
    return new Date(string).toString().substring(0, 21);
}

var HttpClient = function() {
    this.get = function(aUrl, asyncOrNah, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200) aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open("GET", aUrl, asyncOrNah);
        anHttpRequest.send(null);
    }

    this.delete = function(aUrl, aCallback) {
        console.log("Delete");
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200) aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open("DELETE", aUrl, true);
        anHttpRequest.send(null);
    }

    this.put = function(aUrl, params, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200) aCallback(anHttpRequest.responseText);
        }
        anHttpRequest.onload = ajaxSuccess;
        anHttpRequest.open("PUT", aUrl, true);
        anHttpRequest.setRequestHeader("Content-Type", "application/json");
        anHttpRequest.send(JSON.stringify(params));
    }
}

function ajaxSuccess () {
  console.log(this.responseText);
  var res = JSON.parse(this.response);
  if (res.err) {
    document.getElementById('requestMsgBox').innerHTML = `
    <div class="alert alert-danger alert-dismissible" role="alert">
    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    <strong>Error!</strong> ${res.msg}
    </div>
    `;
  } else if (res.msg) {
    document.getElementById('requestMsgBox').innerHTML = `
    <div class="alert alert-success alert-dismissible" role="alert">
    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    <strong>Vellykket!</strong> ${res.msg}
    </div>
    `;
  }
}

function updateProgress (oEvent) {
  if (oEvent.lengthComputable) {
    var percentComplete = Math.round(oEvent.loaded / oEvent.total *100);
    document.getElementById('requestMsgBox').innerHTML = `
    <div class="alert alert-warning alert-dismissible" role="alert">
    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    <strong>Laster opp</strong> ${percentComplete} %
    </div>
    `;
  } else {
    // Unable to compute progress information since the total size is unknown
    console.log("error");
  }
}

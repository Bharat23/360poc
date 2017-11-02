var viewer360;

var initPhotoViewer = (data) => {
    console.log(data);
    if(viewer360) {
        viewer360.destroy();
    }

    viewer360 = PhotoSphereViewer({
        container: 'viewer360',
        panorama: data,
        fisheye: true,
        time_anim: false
    });
    
    viewer360.on('position-updated', (e) => {
        console.log('Position Updated: Latitude: ', e.latitude, ' longitude: ', e.longitude);
    });
    
    viewer360.on('click', (e) => {
        console.log(e);
    });
};

var presentThumbnail = (images) => {
    console.log('here', images);
    images.map(val => {
        var tmp = imageThumbnail(val);
        document.getElementById('thumbnail-container').appendChild(tmp);
    });
};

var imageThumbnail = data => {
    var div = document.createElement('div');
    div.setAttribute('style', "background-image: url('"+ data.url +"'); background-size: cover;");
    div.setAttribute('data-img-src', data.url);
    div.setAttribute('data-img-dbid', data.dbid);
    return div;
};

var fetchImages = () => {
    return fetch('/api/getimages')
        .then(response => response.json())
        .then(data => {
            console.log('Image Data', data);
            return data;
        })
        .catch(err => console.error(err));
};

var init = () => {
    fetchImages()
    .then(data => {
        console.log('Images', data);
        presentThumbnail(data.images);
    });
    getToken((token, expires) => {
        var options = {
        env: 'AutodeskProduction',
        accessToken: token
        };
        var documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGVzdC1idWNrZXQtYmhhcmF0L0hvdXNlLmR3Zng';
        Autodesk.Viewing.Initializer(options, function onInitialized() {
            Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        });
    });
};

document.getElementById('thumbnail-container').addEventListener('click', (e) => {
    console.log(e.target.dataset.imgSrc);
    if(e.target.dataset.imgSrc) {
        initPhotoViewer(e.target.dataset.imgSrc);
    }
    if(e.target.dataset.imgDbid) {
        let dbId = e.target.dataset.imgDbid;
        //code here for calling the dbid
        //2731
        moveModel(dbId);
    }
});

var moveModel = (dbId) => {
    viewer.model.selector.setSelection([dbId], 2);
    viewer.fitToView([dbId]);
};

//code to fetch the auth token for viewer
var getToken = function(callback) {
    fetch('/api/oauth/public')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        callback(data.access_token, data.expires_in);
    })
    .catch(err => console.error(err));
};

var viewer;
var lmvDoc;
var viewables;
var indexViewable;
/**
* Autodesk.Viewing.Document.load() success callback.
* Proceeds with model initialization.
*/
function onDocumentLoadSuccess(doc) {

// A document contains references to 3D and 2D viewables.
var viewables = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {'type':'geometry', role: '3d'}, true);
if (viewables.length === 0) {
    console.error('Document contains no viewables.');
    return;
}

// Choose any of the avialble viewables
var initialViewable = viewables[0];
var svfUrl = doc.getViewablePath(initialViewable);
var modelOptions = {
    sharedPropertyDbPath: doc.getPropertyDbPath()
};

var viewerDiv = document.getElementById('MyViewerDiv');
viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv);
viewer.start(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);

indexViewable = 0;
lmvDoc = doc;
loadModel();
}

var loadModel = () => {
var initialViewable = viewables[indexViewable];
var svfUrl = lmvDoc.getViewablePath(initialViewable);
var modelOptions = {
    sharedPropertyDbPath: lmvDoc.getPropertyDbPath()
};
viewer.loadModel(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
};

/**
* Autodesk.Viewing.Document.load() failuire callback.
*/
function onDocumentLoadFailure(viewerErrorCode) {
console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

/**
* viewer.loadModel() success callback.
* Invoked after the model's SVF has been initially loaded.
* It may trigger before any geometry has been downloaded and displayed on-screen.
*/
function onLoadModelSuccess(model) {
console.log('onLoadModelSuccess()!');
console.log('Validate model loaded: ' + (viewer.model === model));
console.log(model);
}

/**
* viewer.loadModel() failure callback.
* Invoked when there's an error fetching the SVF file.
*/
function onLoadModelError(viewerErrorCode) {
console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
}

function loadNextModel() {
console.log('TODO: Load Next Model');
viewer.tearDown();
viewer.setUp(viewer.config);

// Next viewable index. Loop back to 0 when overflown.
indexViewable = (indexViewable + 1) % viewables.length;
loadModel();
}

window.addEventListener('load', init);
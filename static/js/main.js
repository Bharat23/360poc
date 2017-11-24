var viewer360;
var droppedPin = {};
var trianglePoints = {};
var addedMarker;
var activeTagId;
var dataStore = {
    imageId: 1
};

//fetch user pins by tagId from API
var fetch360Markers = (tagId) => {
    return fetch('/api/user/getpinbyid?tagid=' + tagId)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(err => console.error(err));
};

//fetch all user pins for a blueprint
var fetchAllUserPins = (imageId) => {
    return fetch('/api/user/getpinbyid?imageid=' + imageId)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(err => console.error(err));
};

//renders user pins on 360 images
var renderPersistedMarkers = () => {
    fetch360Markers(activeTagId)
        .then(data => {
            data.forEach(function (marker) {
                addMarker({latitude :marker.latitude || 0, longitude : marker.longitude});
            });
            
        });
};

//initializes the 360 image viewer
var initPhotoViewer = (data) => {
    console.log(data);
    let markers = [];

    if(viewer360) {
        viewer360.destroy();
    }
    let selectedImage = dataStore.images.filter(val => val.tagId === activeTagId)[0];
    selectedImage.path.forEach(pos => {
        markers.push(createMovementMarker(pos.latitude, pos.longitude, selectedImage.url, pos.tagId));
    });
    viewer360 = PhotoSphereViewer({
        container: 'viewer360',
        panorama: data,
        fisheye: true,
        time_anim: false,
        markers: markers
    });
    setTimeout(function () {
        renderPersistedMarkers();
    },2000);

    //360 image movement listener
    viewer360.on('position-updated', (e) => {
        //console.log('Position Updated: Latitude: ', e.latitude, ' longitude: ', e.longitude*(180/Math.PI));
        let tmp = document.getElementsByClassName('pointer-selected');
        for (let el of tmp) {
            let oldStyle = el.getAttribute('style');
            if(oldStyle.indexOf('transform:') !== -1) {
                let oldStyleArr = oldStyle.split(';');
                oldStyleArr.splice(2);
                oldStyle = oldStyleArr.join(';') + ';';
            }
            oldStyle += (' transform: rotate(' + ((Number(el.dataset.angleOffset)+270)%360 + (e.longitude*(180/Math.PI)))%360 + 'deg);');
            el.setAttribute('style', oldStyle);
        }
    });
    
    //360 image single click event listener
    viewer360.on('click', (ev) => {
        console.log(ev, ev.longitude, ev.latitude);
        droppedPin.longitude = ev.longitude;
        droppedPin.latitude = ev.latitude;
        document.getElementById('confirmModal').setAttribute('style', 'display: block; z-index: 100');
    });

    //360 image markers click event listener
    viewer360.on('select-marker', (marker, dblclick) => {
        console.log(marker, dblclick);
        if (dblclick === true) {
            if (marker.data && marker.data.generated) {
                viewer360.removeMarker(marker);
            }
        }
        else {
            if(marker.data && marker.data.redirect) {
                console.log('From circle', marker.data.redirect);
                document.getElementsByClassName('psv-canvas')[0].style += ' ; transition: all 3s; transform: scale(1.2);';
                setTimeout(() => {
                    let newImg = dataStore.images.filter(val => val.tagId === marker.data.tagId)[0].url;
                    activeTagId = marker.data.tagId;
                    initPhotoViewer(newImg);
                    movePointerLocation(marker.data.tagId);
                }, 2000);
            }
        }
    });
};

//create the markers for showing naviagation on 360 images
var createMovementMarker = (latitude, longitude, imageUrl, tagId) => {
    let temp = {
        id: '#circle' + Math.random(),
        image: '/images/movement.gif',
        latitude: latitude,
        longitude: longitude,
        tooltip: 'Move',
        anchor: 'bottom center',
        width: 32,
        height: 32,
        visible: true,
        data: {
            redirect: true,
            imageUrl: imageUrl,
            tagId: tagId
        }
    };
    return Object.assign({}, temp);
};

//renders images thumnail section on the screen
var presentThumbnail = (images) => {
    console.log('here', images);
    images.map(val => {
        var tmp = imageThumbnail(val);
        document.getElementById('thumbnail-container').appendChild(tmp);
    });
};

//create image thumbnail component
var imageThumbnail = (data) => {
    var div = document.createElement('div');
    div.setAttribute('style', "background-image: url('"+ data.url +"'); background-size: cover;");
    div.setAttribute('data-img-src', data.url);
    div.setAttribute('data-tag-id', data.tagId);
    return div;
};

//fetch images for 360 from API
var fetchImages = () => {
    return fetch('/api/getimages')
        .then(response => response.json())
        .then(data => {
            console.log('Image Data', data);
            return data;
        })
        .catch(err => console.error(err));
};

//fetch location pointer from API
var fetchBlueprintPointers = (imageId) => {
    return fetch('/api/admin/getpointers?imageid=1')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                return data;
            })
            .catch(err => console.log('Some Error Occurred', err));
};

//create location pointer component
var createPointer = data => {
    var div = document.createElement('div');
    div.setAttribute('class', 'pointer');
    div.setAttribute('style', 'top: '+ data.yPerc + '%; left: ' + data.xPerc + '%;');
    div.setAttribute('data-tag-id', data.tagId);
    div.setAttribute('data-angle-offset', '' + data.offset);
    return div;
};

//click eveny listener for image thumbnail section
document.getElementById('thumbnail-container').addEventListener('click', (e) => {
    console.log(e.target.dataset.imgSrc);
    if(e.target.dataset.tagId) {
        movePointerLocation(e.target.dataset.tagId);
        activeTagId = e.target.dataset.tagId;
    }
    if(e.target.dataset.imgSrc) {
        initPhotoViewer(e.target.dataset.imgSrc);
    }
});

//takes care movement of user on blueprint by marking with red boundry
var movePointerLocation = (tagId) => {
    cleanSelectedPointers();
    let tmp = "div[data-tag-id=" + tagId + "][class=pointer]";
    let selectedPointer = document.querySelectorAll(tmp);
    for (let el of selectedPointer) {
        el.classList += ' pointer-selected';
        el.style.transform = 'rotate(' + ((270 + Number(el.dataset.angleOffset))%360) + 'deg)';
    }
};

//cleans previous position of user from blueprint
var cleanSelectedPointers = () => {
    var pointers = document.getElementsByClassName('pointer');
    for (let el of pointers) {
        el.setAttribute('class', 'pointer');
    }
};

//return new (x, y) co-ordinates on passing (x, y) of origin, angle and distance from center
var findNewPoint = (x, y, angle, distance) => {
    var result = {};
    result.x = Math.round(Math.cos(angle * Math.PI / 180) * distance + x);
    result.y = Math.round(Math.sin(angle * Math.PI / 180) * distance + y);
    return result;
};

//event listener for modal cancel button
document.getElementById('confirmCancel').addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('confirmModal').style.display = 'none';
});

//event listener for modal ok button || adds pin on 360 and open blueprint
document.getElementById('confirmOk').addEventListener('click', e => {
    document.getElementById('confirmModal').style.display = 'none';
    addedMarker = addMarker({
        longitude: droppedPin.longitude,
        latitude: droppedPin.latitude,
    });
    viewer360.animate(droppedPin, 1000);
    let blueprintThumbnailContainer = document.getElementsByClassName('blueprint-thumbnail-container')[0];
    blueprintThumbnailContainer.click();
    let largeBlueprint = document.getElementsByClassName('blueprint-large')[0];
    let selectedPointer = largeBlueprint.querySelector('.pointer-selected');
    let y = (parseFloat(selectedPointer.style.top.replace('%'))/100) * 400;//image height
    let x = (parseFloat(selectedPointer.style.left.replace('%'))/100) * 800; //image width
    trianglePoints.B = {x: Math.round(x), y: Math.round(y)};
    let finalAngle = (droppedPin.longitude*(180/Math.PI) + Number(selectedPointer.dataset.angleOffset)) % 360;
    let newPoints = findNewPoint(x, y, finalAngle, 30);
    trianglePoints.A = {x: newPoints.x, y: newPoints.y};
    createUserPinBlueprint(newPoints.x, newPoints.y, 800, 400);
});

//create non-movable previous user pins on blueprints
var createStaticUserPinBlueprint = (x, y) => {
    let div = document.createElement('div');
    div.setAttribute('class', 'user-pointer');
    div.setAttribute('style', 'position:absolute');
    div.setAttribute('style', 'top: '+y +'%; left: '+ x + '%');
    document.getElementsByClassName('blueprint-large')[0].appendChild(div);
};

//create movable user pins on blueprints with dragging listeners
var createUserPinBlueprint = (x, y , imageX, imageY) => {
    let div = document.createElement('div');
    div.setAttribute('class', 'user-pointer');
    div.setAttribute('id', 'dragme');
    let top = (y/imageY) * 100;
    let left = (x/imageX) * 100;
    document.getElementsByClassName('blueprint-large')[0].appendChild(div);
    div.setAttribute('style', 'position:absolute');
    div.setAttribute('style', 'top: '+y +'px; left: '+ x + 'px');

    document.getElementById("dragme").addEventListener("dblclick",  function() {
        var dropItHere = confirm("Do you want to save it now?");
        if(dropItHere) {
            // TO DO - make api call
            console.log(this);
            let tagId = document.getElementsByClassName('pointer-selected')[0].getAttribute('data-tag-id');
            let payload = {
                x: this.offsetLeft,
                y: this.offsetTop,
                xPerc: (this.offsetLeft/800)*100,
                yPerc: (this.offsetTop/400)*100,
                tagId: tagId,
                latitude: addedMarker.latitude,
                longitude: addedMarker.longitude
            };
            fetch('/api/user/storepin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                console.log(this);
                this.setAttribute('id', '');
                this.onmousedown = undefined;
                this.onmousemove = undefined;
                this.onmouseup = undefined;
            })
            .catch(err => console.error(err));
        }
    });

    let dragMe = document.getElementById("dragme");
    if (dragMe) {
        dragMe.onmousedown = function(e) {
            this.prevX = e.clientX;
            this.prevY = e.clientY;
            console.log('mousedown', e);
            this.mouseDown = true;
        };
        dragMe.onmousemove = function(e) {
            if(this.mouseDown) {
                this.style.left = (Number(this.style.left.substring(0, this.style.left.length-2)) + (e.clientX - this.prevX)) + "px";
                this.style.top = (Number(this.style.top.substring(0, this.style.top.length-2)) + (e.clientY - this.prevY)) + "px";
            }
            this.prevX = e.clientX;
            this.prevY = e.clientY;
        };
        dragMe.onmouseup = function(e) {
            trianglePoints.C = {x: Number(this.style.left.substring(0, this.style.left.length-2)), y: Number(this.style.top.substring(0, this.style.top.length-2))};
            this.mouseDown = false;
            console.log(trianglePoints);
    
            trianglePoints.A = findNewPoint(trianglePoints.B.x, trianglePoints.B.y, 0, 30);
            let BA = {x: (trianglePoints.B.x - trianglePoints.A.x), y: (trianglePoints.B.y - trianglePoints.A.y)};
            let BC = {x: (trianglePoints.B.x - trianglePoints.C.x), y: (trianglePoints.B.y - trianglePoints.C.y)};
            let LHS = (BA.x*BC.x) + (BA.y*BC.y);
            let RHS = Math.sqrt(Math.pow(BA.x, 2) + Math.pow(BA.y, 2)) * Math.sqrt(Math.pow(BC.x, 2) + Math.pow(BC.y, 2));
            let finalAngle = (Math.acos((LHS/RHS))) * (180/ Math.PI);
            if ( trianglePoints.C.y < trianglePoints.B.y ) {
                finalAngle = 360 - finalAngle;
            }
            let largeBlueprint = document.getElementsByClassName('blueprint-large')[0];
            let selectedPointer = largeBlueprint.querySelector('.pointer-selected');
            console.log(finalAngle);
            viewer360.animate({latitude: 0, longitude: (finalAngle - (selectedPointer.dataset.angleOffset)) * (Math.PI/180)}, 1000);
            removeMarker(addedMarker);
            addedMarker = addMarker({latitude: droppedPin.latitude, longitude: (finalAngle - (selectedPointer.dataset.angleOffset)) * (Math.PI/180)});
        };
    }
    
};

//function to add user pin on 360
var addMarker = obj => {
    return viewer360.addMarker({
            id: '#' + Math.random(),
            longitude: obj.longitude,
            latitude: obj.latitude,
            image: '/images/red-pin.png',
            width: 32,
            height: 32,
            anchor: 'bottom center',
            tooltip: 'Generated pin',
            data: {
            generated: true
            }
        });
};

//function to remove user pin from 360 || takes marker object to remove
var removeMarker = marker => viewer360.removeMarker(marker);

//initializes the environment || executes at page load
var init = () => {
    fetchImages()
    .then(data => {
        console.log('Images', data);
        dataStore.images = data.images.slice();
        presentThumbnail(data.images);
    });
    fetchBlueprintPointers()
    .then(data => {
        console.log(data);
        data.map(val => {
            let divSmall = createPointer(val);
            let divLarge = divSmall.cloneNode(true);
            document.getElementsByClassName('blueprint-thumbnail')[0].appendChild(divSmall);
            document.getElementsByClassName('blueprint-large')[0].appendChild(divLarge);
        });
    });
    fetchAllUserPins(1)
    .then(data => {
        data
        .map(val => createStaticUserPinBlueprint(val.xPerc, val.yPerc));
    });
};

//window load event listener || code flow starts from here
window.addEventListener('load', init);
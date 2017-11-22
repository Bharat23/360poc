var viewer360;
var droppedPin = {};
var trianglePoints = {};
var addedMarker;

var fetch360Markers = (tagId) => {
    return fetch('/api/user/getpinbyid?tagid=' + tagId)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(err => console.error(err));
};

var renderPersistedMarkers = () => {
    fetch360Markers('tag-445-238')
        .then(data => {
            console.log(data);
            data.forEach(function (marker) {
                console.log("marker", marker);
                addMarker({latitude : marker.latitude, longitude : marker.longitude})
            })
        })
};

var initPhotoViewer = (data) => {
    console.log(data);
    if(viewer360) {
        viewer360.destroy();
    }

    viewer360 = PhotoSphereViewer({
        container: 'viewer360',
        panorama: data,
        fisheye: true,
        time_anim: false,
        markers: [
            // {
            //     id: 'image',
            //     longitude: 1.3810192118694424,
            //     latitude: 0.024623999874564317,
            //     image: 'https://s3.amazonaws.com/novainspec/Pier+17/skin/NOVA_Hotspot%20Circle.png',
            //     width: 32,
            //     height: 32,
            //     anchor: 'bottom center',
            //     tooltip: 'A image marker. <b>Click me!</b>',
            //     content: ''
            // },
            {
                id: 'circle',
                circle: 30,
                latitude: 0.024623999874564317,
                longitude: 1.3810192118694424,
                tooltip: 'Move',
                data: {
                    redirect: true,
                    imageUrl: '/images/2.jpg'
                }
            }
        ]
    });
    setTimeout(function () {
        renderPersistedMarkers();
    },2000)


    
    viewer360.on('position-updated', (e) => {
        console.log('Position Updated: Latitude: ', e.latitude, ' longitude: ', e.longitude*(180/Math.PI));
        let tmp = document.getElementsByClassName('pointer-selected');
        for (let el of tmp) {
            let oldStyle = el.getAttribute('style');
            if(oldStyle.indexOf('transform:') !== -1) {
                let oldStyleArr = oldStyle.split(';');
                oldStyleArr.splice(2);
                oldStyle = oldStyleArr.join(';') + ';';
            }
            oldStyle += (' transform: rotate(' + e.longitude*(180/Math.PI) + 'deg);');
            el.setAttribute('style', oldStyle);
        }
    });
    
    viewer360.on('click', (ev) => {
        console.log(ev, ev.longitude, ev.latitude);
        droppedPin.longitude = ev.longitude;
        droppedPin.latitude = ev.latitude;
        document.getElementById('confirmModal').setAttribute('style', 'display: block; z-index: 100');
    });

    viewer360.on('dblclick', (e, dblclick) => {
        console.log('dbl', e, dblclick);
    });

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
                    initPhotoViewer(marker.data.imageUrl);
                    movePointerLocation('tag-237-121');
                }, 2000);
            }
        }
    });
};

var presentThumbnail = (images) => {
    console.log('here', images);
    images.map(val => {
        var tmp = imageThumbnail(val);
        document.getElementById('thumbnail-container').appendChild(tmp);
    });
};

var imageThumbnail = (data) => {
    var div = document.createElement('div');
    div.setAttribute('style', "background-image: url('"+ data.url +"'); background-size: cover;");
    div.setAttribute('data-img-src', data.url);
    div.setAttribute('data-tag-id', data.tagId);
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

var fetchBlueprintPointers = (imageId) => {
    return fetch('/api/admin/getpointers?imageid=1')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                return data;
            })
            .catch(err => console.log('Some Error Occurred', err));
};

var createPointer = data => {
    var div = document.createElement('div');
    div.setAttribute('class', 'pointer');
    div.setAttribute('style', 'top: '+ data.yPerc + '%; left: ' + data.xPerc + '%;');
    div.setAttribute('data-tag-id', data.tagId);
    return div;
};

document.getElementById('thumbnail-container').addEventListener('click', (e) => {
    console.log(e.target.dataset.imgSrc);
    if(e.target.dataset.imgSrc) {
        initPhotoViewer(e.target.dataset.imgSrc);
    }
    if(e.target.dataset.tagId) {
        movePointerLocation(e.target.dataset.tagId);
    }
});

var movePointerLocation = (tagId) => {
    cleanSelectedPointers();
    let tmp = "div[data-tag-id=" + tagId + "][class=pointer]";
    let selectedPointer = document.querySelectorAll(tmp);
    for (let el of selectedPointer) {
        el.classList += ' pointer-selected';
    }
};

var cleanSelectedPointers = () => {
    var pointers = document.getElementsByClassName('pointer');
    for (let el of pointers) {
        el.setAttribute('class', 'pointer');
    }
};

var findNewPoint = (x, y, angle, distance) => {
    var result = {};
    result.x = Math.round(Math.cos(angle * Math.PI / 180) * distance + x);
    result.y = Math.round(Math.sin(angle * Math.PI / 180) * distance + y);
    return result;
};

document.getElementsByClassName('blueprint-thumbnail-container')[0].addEventListener('click', (e) => {

});

document.getElementById('confirmCancel').addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('confirmModal').style.display = 'none';
});

document.getElementById('confirmOk').addEventListener('click', e => {
    document.getElementById('confirmModal').style.display = 'none';
    addedMarker = viewer360.addMarker({
        id: '#' + Math.random(),
        longitude: droppedPin.longitude,
        latitude: droppedPin.latitude,
        image: '/images/red-pin.png',
        width: 32,
        height: 32,
        anchor: 'bottom center',
        tooltip: 'Generated pin',
        data: {
          generated: true
        }
    });
    viewer360.animate(droppedPin, 1000);
    let blueprintThumbnailContainer = document.getElementsByClassName('blueprint-thumbnail-container')[0];
    blueprintThumbnailContainer.click();
    let finalAngle = (droppedPin.longitude*(180/Math.PI) + 90) % 360;
    let largeBlueprint = document.getElementsByClassName('blueprint-large')[0];
    let selectedPointer = largeBlueprint.querySelector('.pointer-selected');
    let y = (parseFloat(selectedPointer.style.top.replace('%'))/100) * 400;//image height
    let x = (parseFloat(selectedPointer.style.left.replace('%'))/100) * 800; //image width
    trianglePoints.B = {x: Math.round(x), y: Math.round(y)};
    let newPoints = findNewPoint(x, y, finalAngle, 30);
    trianglePoints.A = {x: newPoints.x, y: newPoints.y};
    createUserPinBlueprint(newPoints.x, newPoints.y, 800, 400);
});

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
            })
            .catch(err => console.error(err));
        }
    });


    document.getElementById("dragme").onmousedown = function(e) {
        this.prevX = e.clientX;
        this.prevY = e.clientY;
        console.log('mousedown', e);
        this.mouseDown = true;
    };
    document.getElementById("dragme").onmousemove = function(e) {
        if(this.mouseDown) {
            this.style.left = (Number(this.style.left.substring(0, this.style.left.length-2)) + (e.clientX - this.prevX)) + "px";
            this.style.top = (Number(this.style.top.substring(0, this.style.top.length-2)) + (e.clientY - this.prevY)) + "px";
        }
        this.prevX = e.clientX;
        this.prevY = e.clientY;
    };
    document.getElementById("dragme").onmouseup = function(e) {
        //alert("X = " + (Number(this.style.left.substring(0, this.style.left.length-2))/8 + "m, " + "Y=" +  Number(this.style.top.substring(0, this.style.top.length-2))/8) + "m");
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
        console.log(finalAngle);
        viewer360.animate({latitude: 0, longitude: (finalAngle - 90) * (Math.PI/180)}, 1000);
        removeMarker(addedMarker);
        addedMarker = addMarker({latitude: 0, longitude: (finalAngle - 90) * (Math.PI/180)});
    };
};

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
var removeMarker = marker => viewer360.removeMarker(marker);

var init = () => {
    fetchImages()
    .then(data => {
        console.log('Images', data);
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
};


window.addEventListener('load', init);
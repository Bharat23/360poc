
var viewer = PhotoSphereViewer({
    container: '360viewer',
    panorama: '/images/sphere3.jpg'
});

viewer.on('position-updated', (e) => {
    console.log('Position Updated: Latitude: ', e.latitude, ' longitude: ', e.longitude);
});

viewer.on('click', (e) => {
    console.log(e);
});

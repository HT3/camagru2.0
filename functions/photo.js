// (function() {
//     var canvas = document.getElementById('canvas');
//     var context = canvas.getContext('2d');
//     var video = document.getElementById('video');
//     var image = new Image();

//     image.src = document.getElementById('sticker').value;

//     if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//         navigator.mediaDevices.getUserMedia({
//             video: true 
//         }).then(function(stream) {
//             video.srcObject = stream;
//             video.play();
//         });
//     }

//     document.getElementById('capture').addEventListener('click', function() {
//         image.src = document.getElementById('sticker').value;
//         context.drawImage(video, 0, 0, 400, 300);
//         context.drawImage(image, 200, 150, 200, 150,);
//         photo.setAttribute('src', canvas.toDataURL('image/png'));
//         document.getElementById('image').value = canvas.toDataURL('image/png');
//         //console.log(document.getElementById('image').value);
//     });

// })();
(function() {
    var video = document.getElementById('video')
        canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
        photo = document.getElementById('photo'),
        vendorUrl = window.URL || window.webkitURL;
        
    navigator.getMedia =    navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia;

    navigator.getMedia({
        video: true,
        audio: false
    }, function(stream) {
        video.src = vendorUrl.createObjectURL(stream);
        video.play();
    }, function(error) {
        console.log("Error: " + error);
    });

    document.getElementById('capture').addEventListener('click', function() {
        context.drawImage(video, 0, 0, 400, 300);
    });
})();
import assert from 'assert';
import OrientedImageSource from 'Source/OrientedImageSource';

describe('OrientedImageSource', function () {
    it('instance OrientedImageSource', function (done) {
        const source = new OrientedImageSource({ url: 'http://source.test' });
        source.whenReady
            .then((a) => {
                assert.equal(Object.keys(a).length, 2);
                done();
            }).catch(done);
    });

    it('should return keys OrientedImageSource from request', function () {
        const source = new OrientedImageSource({ url: 'http://source.test' });
        const image = { cameraId: 5, panoId: 10 };
        const keys = source.keysFromExtent(image);
        assert.equal(image.cameraId, keys[0]);
        assert.equal(image.panoId, keys[1]);
    });
});


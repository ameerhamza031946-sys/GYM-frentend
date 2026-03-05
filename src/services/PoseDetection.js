import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

let detector = null;

export const initDetector = async () => {
    if (detector) return detector;

    await tf.ready();
    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
    };

    detector = await poseDetection.createDetector(model, detectorConfig);
    return detector;
};

export const detectPose = async (videoElement) => {
    if (!detector) await initDetector();

    const poses = await detector.estimatePoses(videoElement);
    return poses && poses.length > 0 ? poses[0] : null;
};

// Logic to calculate joint angles (e.g., knee for squats)
export const calculateAngle = (p1, p2, p3) => {
    if (!p1 || !p2 || !p3) return null;

    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);

    if (angle > 180.0) {
        angle = 360 - angle;
    }

    return angle;
};

export const getSquatFormFeedback = (pose) => {
    if (!pose || !pose.keypoints) {
        return { status: 'SCANNING', message: 'Detecting form...', color: 'text-slate-400' };
    }

    const keypoints = pose.keypoints.reduce((acc, kp) => {
        acc[kp.name] = kp;
        return acc;
    }, {});

    const hip = keypoints.left_hip || keypoints.right_hip;
    const knee = keypoints.left_knee || keypoints.right_knee;
    const ankle = keypoints.left_ankle || keypoints.right_ankle;

    if (hip && knee && ankle) {
        const angle = calculateAngle(hip, knee, ankle);

        if (angle < 90) return { status: 'OPTIMAL', message: 'Good depth!', color: 'text-neon-green' };
        if (angle < 120) return { status: 'DECENT', message: 'Go a bit lower...', color: 'text-neon-amber' };
        return { status: 'HIGH', message: 'Sink those hips!', color: 'text-neon-red' };
    }

    return { status: 'SCANNING', message: 'Detecting form...', color: 'text-slate-400' };
};

import { useEffect, useState } from 'react';

export interface BodyPosture {
  isLookingAtCamera: boolean; // Face directly toward camera
  isTurned: boolean; // Turned to side
  isBackToCamera: boolean; // Back to camera
  headTilt: number; // -1 to 1 (left tilt to right tilt)
  shoulderRotation: number; // Degree rotation of shoulders
  hipRotation: number; // Degree rotation of hips
  bodyConfidence: number; // 0-1 confidence in detection
  bodyParts: {
    headVisible: boolean;
    shouldersVisible: boolean;
    torsVisible: boolean;
    legsVisible: boolean;
  };
}

export const usePostureDetection = (landmarks: any[] | null) => {
  const [posture, setPosture] = useState<BodyPosture>({
    isLookingAtCamera: false,
    isTurned: false,
    isBackToCamera: false,
    headTilt: 0,
    shoulderRotation: 0,
    hipRotation: 0,
    bodyConfidence: 0,
    bodyParts: {
      headVisible: false,
      shouldersVisible: false,
      torsVisible: false,
      legsVisible: false,
    },
  });

  useEffect(() => {
    if (!landmarks || landmarks.length < 33) {
      setPosture((prev) => ({
        ...prev,
        bodyConfidence: 0,
      }));
      return;
    }

    // Key landmarks indices
    const NOSE = 0;
    const LEFT_EYE = 2;
    const RIGHT_EYE = 5;
    const LEFT_SHOULDER = 11;
    const RIGHT_SHOULDER = 12;
    const LEFT_ELBOW = 13;
    const RIGHT_ELBOW = 14;
    const LEFT_HIP = 23;
    const RIGHT_HIP = 24;
    const LEFT_KNEE = 25;
    const RIGHT_KNEE = 26;
    const LEFT_ANKLE = 27;
    const RIGHT_ANKLE = 28;

    try {
      const nose = landmarks[NOSE];
      const leftEye = landmarks[LEFT_EYE];
      const rightEye = landmarks[RIGHT_EYE];
      const leftShoulder = landmarks[LEFT_SHOULDER];
      const rightShoulder = landmarks[RIGHT_SHOULDER];
      const leftHip = landmarks[LEFT_HIP];
      const rightHip = landmarks[RIGHT_HIP];
      const leftKnee = landmarks[LEFT_KNEE];
      const rightKnee = landmarks[RIGHT_KNEE];

      // Visibility thresholds
      const VISIBLE_THRESHOLD = 0.1;

      // Check which body parts are visible
      const headVisible =
        nose?.visibility > VISIBLE_THRESHOLD &&
        leftEye?.visibility > VISIBLE_THRESHOLD &&
        rightEye?.visibility > VISIBLE_THRESHOLD;

      const shouldersVisible =
        leftShoulder?.visibility > VISIBLE_THRESHOLD &&
        rightShoulder?.visibility > VISIBLE_THRESHOLD;

      const torsVisible = shouldersVisible;

      const legsVisible =
        leftKnee?.visibility > VISIBLE_THRESHOLD &&
        rightKnee?.visibility > VISIBLE_THRESHOLD;

      // Calculate head tilt (using eye positions)
      let headTilt = 0;
      if (leftEye && rightEye) {
        const eyeHeightDiff = rightEye.y - leftEye.y;
        const eyeDistance = Math.abs(rightEye.x - leftEye.x);
        headTilt = Math.atan2(eyeHeightDiff, eyeDistance);
      }

      // Calculate shoulder rotation (how much person is turned)
      let shoulderRotation = 0;
      let shoulderConfidence = 0;
      if (leftShoulder && rightShoulder && shouldersVisible) {
        const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;

        // Hip position
        let hipMidX = 0.5;
        if (leftHip && rightHip) {
          hipMidX = (leftHip.x + rightHip.x) / 2;
        }

        // Angle of shoulder line
        const shoulderAngle = Math.atan2(
          rightShoulder.y - leftShoulder.y,
          rightShoulder.x - leftShoulder.x
        );

        shoulderRotation = (shoulderAngle * 180) / Math.PI;
        shoulderConfidence =
          (leftShoulder.visibility + rightShoulder.visibility) / 2;
      }

      // Calculate hip rotation (similar to shoulder)
      let hipRotation = 0;
      let hipConfidence = 0;
      if (leftHip && rightHip) {
        const hipAngle = Math.atan2(
          rightHip.y - leftHip.y,
          rightHip.x - leftHip.x
        );
        hipRotation = (hipAngle * 180) / Math.PI;
        hipConfidence = (leftHip.visibility + rightHip.visibility) / 2;
      }

      // Determine if person is looking at camera (nose roughly between eyes and centered)
      let isLookingAtCamera = false;
      if (headVisible && nose && leftEye && rightEye) {
        const noseX = nose.x;
        const eyeCenterX = (leftEye.x + rightEye.x) / 2;
        const eyeDistance = Math.abs(rightEye.x - leftEye.x);

        // If nose is roughly centered between eyes, looking at camera
        isLookingAtCamera = Math.abs(noseX - eyeCenterX) < eyeDistance * 0.15;
      }

      // Determine if turned to side
      let isTurned = false;
      if (shoulderRotation) {
        isTurned = Math.abs(shoulderRotation) > 15;
      }

      // Determine if back to camera (shoulders visible but nose/eyes not visible properly)
      const isBackToCamera =
        shouldersVisible &&
        !isLookingAtCamera &&
        (!headVisible || nose?.visibility < 0.15);

      // Overall body confidence
      const bodyConfidence = Math.min(
        1,
        (shoulderConfidence + hipConfidence) / 2 + (headVisible ? 0.1 : 0)
      );

      setPosture({
        isLookingAtCamera: isLookingAtCamera && !isTurned,
        isTurned,
        isBackToCamera,
        headTilt,
        shoulderRotation,
        hipRotation,
        bodyConfidence,
        bodyParts: {
          headVisible,
          shouldersVisible,
          torsVisible,
          legsVisible,
        },
      });
    } catch (error) {
      console.error('Error calculating posture:', error);
    }
  }, [landmarks]);

  return posture;
};

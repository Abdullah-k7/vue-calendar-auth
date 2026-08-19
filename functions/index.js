const {onSchedule} = require("firebase-functions/v2/scheduler");
const {setGlobalOptions} = require("firebase-functions/v2");

const {initializeApp} = require("firebase-admin/app");
const {getFirestore, Timestamp} = require("firebase-admin/firestore");
const {getMessaging} = require("firebase-admin/messaging");

initializeApp();

setGlobalOptions({
  region: "me-central2",
});

exports.sendEventReminders = onSchedule("* * * * *", async () => {
  const db = getFirestore();
  const now = Timestamp.now();

  const snapshot = await db
      .collectionGroup("events")
      .where("notificationSent", "==", false)
      .where("reminderAt", "<=", now)
      .get();

  for (const eventDoc of snapshot.docs) {
    const eventData = eventDoc.data();

    if (!eventData.reminderAt) {
      continue;
    }

    const userRef = eventDoc.ref.parent.parent;

    if (!userRef) {
      continue;
    }

    const userId = userRef.id;

    const devicesSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("devices")
        .get();

    const fids = devicesSnapshot.docs
        .map((deviceDoc) => {
          return deviceDoc.data().installationId || deviceDoc.id;
        })
        .filter(Boolean);

    if (fids.length === 0) {
      console.log(`No devices found for user ${userId}`);
      continue;
    }

    const message = {
      notification: {
        title: "Upcoming Event",
        body: `${eventData.title} is coming up soon.`,
      },
      fids,
    };

    const response = await getMessaging().sendEachForMulticast(message);

    console.log(
        `Event ${eventDoc.id}: ${response.successCount} notification(s) sent.`,
    );

    if (response.successCount > 0) {
      await eventDoc.ref.update({
        notificationSent: true,
        notificationSentAt: Timestamp.now(),
      });
    }
  }
});

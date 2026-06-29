import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';
import type { HealthProfile, User } from './definitions';
import { generateHealthId } from './utils';

export async function createUser(email: string, password: string, name: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    const healthId = generateHealthId();

    const newUser: User = {
        uid: user.uid,
        healthId,
        name: user.displayName || name,
        email: user.email!,
        createdAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, "users", user.uid), newUser);

    return { user, healthId };
}

export async function getUserProfile(userId: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        return userDoc.data() as User;
    } else {
        return null;
    }
}

export async function updateUserProfile(userId: string, profileData: HealthProfile) {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { profile: profileData }, { merge: true });
}

export async function getAllUsers(): Promise<User[]> {
    const usersCollectionRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollectionRef);
    const usersList = usersSnapshot.docs.map(doc => doc.data() as User);
    return usersList;
}

export async function getUserByHealthId(healthId: string): Promise<User | null> {
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, where("healthId", "==", healthId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Assuming healthId is unique, there should be at most one document.
        const userDoc = querySnapshot.docs[0];
        return userDoc.data() as User;
    } else {
        return null;
    }
}

export async function handleSignOut() {
    await signOut(auth);
}

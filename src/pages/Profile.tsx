import React, { FC, useEffect, useState } from 'react';
import { IonContent, IonPage, IonTitle, IonToolbar, IonButton, IonIcon, IonButtons, IonLabel, IonItem, IonList, IonSpinner, IonBackButton, IonSegment, IonSegmentButton, IonGrid, IonRow, IonAvatar, IonImg, IonCol, IonHeader, IonCard, IonCardContent, IonFab, IonFabButton, IonInput, IonPopover, IonChip, IonLoading } from '@ionic/react';
import { close, logOutOutline, } from 'ionicons/icons';
import { useGlobals } from '../providers/globalsProvider';
import { collection, DocumentData, DocumentSnapshot, getDocs, getFirestore, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import "./Profile.css"
import OrderCard from '../components/OrderCard';
import { updateUserProfile } from '../providers/firebaseMain';
import { TT } from '../components/utlis/tt';
import { ApplicationCard } from './ApplicationsPage';
import { db } from '../App';
import CreatProfile from './CreatProfile';
import AvatarPicker from '../components/AvatarPicker';
import { useHistory } from 'react-router';
import { usePhoto } from '../hooks/usePhoto';
import useOrders from '../hooks/useOrders';

const Profile: React.FC = () => {
  const { user, profile } = useGlobals()
  const [content, setContent] = useState<"orders" | "deliver" | "editProfile">("orders")
  const [pickAvatar, setPickAvatar] = useState(false)
  // const auth= getAuth()
  // const id = useParams()
  const photo = usePhoto()
  const history = useHistory()
  const uid = getAuth().currentUser?.uid

  useEffect(() => {

  }, [user]);

  const header = <IonHeader><IonToolbar color="secondary" ><IonLabel slot='end'>Profile</IonLabel><IonButtons slot='start'><IonBackButton defaultHref='/'></IonBackButton></IonButtons></IonToolbar></IonHeader>
  if (user === false) {
    return <IonPage>
      {header}
      <IonContent>
        <IonTitle>Sign In First</IonTitle>
        <IonButton onClick={() => history.push("signIn")} fill="clear" color={"primary"}>Here</IonButton>
      </IonContent>
    </IonPage>
  }

  if (profile === null || user == undefined) {
    return (<IonPage>
      {header}
      <IonContent>
        <IonSpinner slot='primary'>Plaese Wait</IonSpinner>
      </IonContent>
    </IonPage>)
  }


  return (
    <IonPage >
      <IonContent>
      <IonItem dir={'rtl'} style={{ paddingLeft: '50px' }}>
        <IonGrid >
          <IonRow>
            <IonRow>
              <IonAvatar
                id="click-trigger">
                <IonImg src={
                  !!profile?.photoURL ? profile.photoURL
                    : require("../assets/avatarPlaceHolder.png")}
                  >
                </IonImg>
              </IonAvatar>
              <IonPopover trigger="click-trigger" triggerAction="click">
                <IonContent
                  class="ion-padding">
                  <IonButton
                    disabled={photo.loading}
                    onClick={() => photo.takePhoto()}
                    fill={'clear'}
                  >{photo.loading ? "Loading..." : "Upload Photo"}
                  </IonButton>
                  <span>OR</span>
                  <IonButton
                  onClick={() => setPickAvatar(!pickAvatar)}
                  fill={'clear'}
                  > choose avatar</IonButton>
                  <div>
                    <AvatarPicker isOpen={pickAvatar} onDidDismiss={() => setPickAvatar(false)}
                      onAvatarSubmit={(url) => { updateUserProfile(uid, { photoURL: url }) }} >
                        </AvatarPicker> 

                  </div>
                </IonContent>
              </IonPopover>
              {/* <IonTitle>token : {token}</IonTitle> */}
            </IonRow>
            <IonCol>
              <IonButton onClick={() => content !== "editProfile" ? setContent("editProfile") : setContent("orders")}>{TT("edit")}
              </IonButton>
              <IonButton color={'danger'} onClick={() => { getAuth().signOut() }}>
                {TT("logOut")}
                <IonIcon icon={logOutOutline}></IonIcon>
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonItem>
      <IonFab horizontal={'start'} vertical={'top'} >
        <IonFabButton color={'light'}
          onClick={() => history.goBack()}
        >
          <IonIcon color={'primary'} icon={close}></IonIcon>
        </IonFabButton>
      </IonFab>
      <IonList>
        <div style={infoContainer}>
          <IonLabel>Name: </IonLabel>
          <IonInput value={profile?.name || "Name"} disabled={true}></IonInput>
        </div>
        <div style={infoContainer}>
          <IonLabel>Email: </IonLabel>
          <IonInput value={profile?.email || "No Email"} disabled={true}></IonInput>
        </div>
        <div style={infoContainer}>
          <IonLabel>Pnone: </IonLabel>
          <IonInput value={profile?.phoneNumber || "No Email"} disabled={true}></IonInput>
        </div>

      </IonList>
      {content !== "editProfile" && <IonSegment value={content}>
        <IonSegmentButton value="orders" onClick={() => setContent('orders')}>
          <IonLabel>orders</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="deliver" onClick={() => setContent('deliver')}>
          <IonLabel>deliver</IonLabel>
        </IonSegmentButton>
      </IonSegment>}
      
    
      {user && content === "orders" &&
        <IonContent>
          <ProfileOrdersList />
        </IonContent>}

      {user && content === "deliver" &&
        <IonContent>
          <ProfileApplicationsList />
        </IonContent>}
      {user && content === "editProfile" &&
        <IonContent>
          <CreatProfile onSave={() => { setContent("deliver") }} />
        </IonContent>}
        </IonContent>
    </IonPage>
  );
};

export default Profile;


const ProfileOrdersList: FC = (props) => {

  const uid :any= getAuth().currentUser?.uid
  useEffect(() => {
    setFilter({userID:uid!})
  }, [])

  const {orders,setFilter,loading,update} = useOrders()
  

  return <IonList>
     {/* <IonLoading isOpen={refreshing}></IonLoading> */}
    {orders && orders.map((value, index, array) => {

      return <OrderCard orderDocSnap={value} key={index} ></OrderCard>
    })}
    {!orders && !loading && <IonButton onClick={() => update(()=>{})}>refresh</IonButton>}
  </IonList>
}



const ProfileApplicationsList: FC = (props) => {
  const [list, setList] = useState<DocumentSnapshot<DocumentData>[]>([])
  const [refreshing, setRefreshing] = useState(true)
  const [isMounted, setIsMounted] = useState(true)
  const { user, profile } = useGlobals()
  useEffect(() => {
    const unsub = getData();
    return () => { unsub() }
  }, [])
  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
    }
  }, [])

  function getData() {
    setRefreshing(true)
    const ref = collection(db, "ordersApplications")
    // var firstQuery = query(ref,orderBy("timeSend","desc"))
    var finalQuery = query(ref, where("byUser", "==", getAuth().currentUser?.uid))

    return onSnapshot(finalQuery, (snap) => {
      if (snap.empty) { return };

      let newList: DocumentSnapshot<DocumentData>[] = []

      snap.forEach((doc) => {
        newList.push(doc)
      })
      if (isMounted) {
        setList(newList)
        setRefreshing(false)
      }
    })
  }

  return <IonList>
    {refreshing && <IonSpinner></IonSpinner>}
    {!!list && list.map((value, index: any) => {
      return <ApplicationCard docsnap={value} key={index}></ApplicationCard>
    })
    }
  </IonList>
}
const infoContainer: any = { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', paddingInlineStart: '2rem' }
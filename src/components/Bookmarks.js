import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import LinkIcon from '@material-ui/icons/Link';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import FolderIcon from '@material-ui/icons/Folder';
import {Button} from '@material-ui/core';
import { Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {TextField} from '@material-ui/core';
import {
    useHistory,
    useLocation
  } from "react-router-dom";
import Axios from 'axios';
// import axios from 'axios';


export default function Bookmarks() {
  const location = useLocation();
  const classes = useStyles();
  const history = useHistory();
  const urlCheck =  new RegExp('^(https?:\\/\\/)?'+ // protocol
                              '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                              '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                              '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                              '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                              '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

  const [newName, setNewName] = React.useState(null); //name variable used during rename of bookmarks and folders
  const [newLink, setNewLink] = React.useState(null);
  const [invokeUrl,setInvokeUrl] = React.useState("https://e9f0h6m3dl.execute-api.us-east-1.amazonaws.com/dev")

  // state variables to show/hide buttons and modals
  const [showFolderButtons, setShowFolderButtons] = React.useState([true, null, null]);     // 1.Create 2.Delete 3.Rename
  const [showBookmarkButtons, setShowBookmarkButtons] = React.useState([null, null, null, null, null]);   // 1.Create 2.Delete 3.Rename 4.Move
  const [showCreateFolderModal, setShowCreateFolderModal] = React.useState(false);
  const [showCreateBookmarkModal, setShowCreateBookmarkModal] = React.useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = React.useState(false);
  const [showEditBookmarkModal, setShowEditBookmarkModal] = React.useState(false);
  const [showMoveBookmarkModal, setShowMoveBookmarkModal] = React.useState(false);
  const [createOrAddFlag, setCreateOrAddFlag] = React.useState(null);

  // keeps track of selected bookmark and folder
  const [selectedFolderId, setSelectedFolderId] = React.useState(null);
  const [selectedBookmarkId, setSelectedBookmarkId] = React.useState(null);       // used in deletion of bookmark
  const [selectedRenameFolderId, setSelectedRenameFolderId] = React.useState(null);
  const [clipboard, setClipboard] = React.useState({id: null,
                                                    name: null,
                                                    type: null,
                                                    folderIndex: null
                                                });

  // main folder data
  const [folders, setFolders] = React.useState(
    {
      "root": {
          "bookmarks": {},
      }
  });


  // API call to get folders 
  useEffect(() => {
    
    fetch(invokeUrl+'/folder?user_id='+location.state.userId)
    .then(res => res.json())
    .then(data => {
        setFolders(data);
    })
  }, [])

  // Redirects to login if not a certified user.
  if(location.state === undefined){
    history.replace("/");
  }

  const logout = () => {
      history.replace('/');
  }

  // Open a new tab of the bookmark
  const navigateToBookmark = (url) => {
    window.open("http://"+url);
  }

  // on click event for folder (set selected) and open the folder
  const handleFolderClick = (e, folderKey) => {
    setSelectedFolderId(folderKey);
    setSelectedBookmarkId(null);
    setShowFolderButtons([true, true, true]);
    setShowBookmarkButtons([true, false, false, false, true])
    
    let temp = folders
    temp[folderKey]["open"] = !temp[folderKey]["open"]
    setFolders(temp);
  };
  
  // click event for bookmarks
  const handleBookmarkClick = (e, bookmarkKey, folderKey) => {
    console.log(bookmarkKey);
    if(folderKey !== "root") {
        setShowFolderButtons([false, false, false]);
        setShowBookmarkButtons([true, true, true, true, false]);
    }
    else {
        setShowFolderButtons([true, false, false]);
        setShowBookmarkButtons([false, true, true, true, true]);
    }
    setSelectedFolderId(folderKey);
    setSelectedBookmarkId(bookmarkKey);
  };

  // Functions for creating bookmarks and folders.
  const createFolder = (e) => {
    if(newName.startsWith(" ")){
      window.alert("Invalid folder name.")
    }
    else {
      Axios.post(invokeUrl+"/folder?folder_name="+newName+"&user_id="+location.state.userId)
      .then(res => {
        let tempFolders = folders;
        tempFolders[res.data] = {
          "bookmarks" : {},
          "name" : newName,
          "open": false,
        }
        setShowCreateFolderModal(false);
      }).catch(error=> {
        console.log(error)
      })
    }
  }

  const createBookmark = () => {
    if(newName.startsWith(" ")){
      window.alert("Invalid folder name.")
    }
    else if(!urlCheck.test(newLink)) {
      window.alert("Invalid url");
    }
    else {
      Axios.post(invokeUrl+"/bookmark?folder_id=root&bookmark_name="+newName+"&url="+newLink+"&user_id="+location.state.userId)
      .then(res => {
        let tempFolders = folders;
        tempFolders["root"]["bookmarks"][res.data] = {
          "name" : newName,
          "url": newLink,
        }
        setFolders(tempFolders);    
        setShowCreateBookmarkModal(false);
      }).catch(error=> {
        console.log(error)
      })
    }
  }

  const addBookmarkToFolder = (e) => {
    if(newName.startsWith(" ")){
      window.alert("Invalid folder name.")
    }
    else if(!urlCheck.test(newLink)) {
      window.alert("Invalid url");
    }
    else {
      console.log(selectedFolderId);
      Axios.post(invokeUrl+"/bookmark?folder_id="+selectedFolderId+"&bookmark_name="+newName+"&url="+newLink+"&user_id="+location.state.userId)
      .then(res => {
        let tempFolders = folders;
        tempFolders[selectedFolderId]["bookmarks"][res.data] = {
          "name" : newName,
          "url": newLink,
        }
        setFolders(tempFolders);    
        setShowCreateBookmarkModal(false);
      }).catch(error=> {
        console.log(error)
      })
    }
  }

  const createFolderModal = () => (  
    <Modal show={showCreateFolderModal} onHide={() => setShowCreateFolderModal(false)}>
        <Modal.Header style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <Modal.Title>Create folder</Modal.Title>
        </Modal.Header>
        <Modal.Body style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <TextField id="outlined-basic" 
                        label="Enter new name:" 
                        variant="outlined"
                        onChange = {updateName}/>
        </Modal.Body>
        <Modal.Footer style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <Button color = "primary" variant= "outlined" className = {classes.modalButton} onClick = {createFolder}>Ok</Button>
            <Button color = "secondary" variant= "outlined" className = {classes.modalButton} onClick = {() => setShowCreateFolderModal(false)}>Cancel</Button>
        </Modal.Footer>
    </Modal>
  )
  
  const createBookmarkModal = () => (
    <Modal show={showCreateBookmarkModal} onHide={() => setShowCreateBookmarkModal(false)}>
        <Modal.Header style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <Modal.Title>Create bookmark</Modal.Title>
        </Modal.Header>
        <Modal.Body style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <TextField id="outlined-basic" 
                        label="Enter new name:" 
                        variant="outlined"
                        onChange = {updateName}/>
                        <br/> <br/>
            <TextField id="outlined-basic" 
                        label="Enter new link url:" 
                        variant="outlined"
                        onChange = {updateLink}/>
        </Modal.Body>
        <Modal.Footer style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <Button color = "primary" variant= "outlined" className = {classes.modalButton} onClick = {() => createOrAddFlag === 0? createBookmark(): addBookmarkToFolder()}>Ok</Button>
            <Button color = "secondary" variant= "outlined" className = {classes.modalButton} onClick = {() => setShowCreateBookmarkModal(false)}>Cancel</Button>
        </Modal.Footer>
    </Modal>
  )

  //Functions for deleting folders and bookmarks
  const deleteFolder = (e) => {
    
    Axios.delete(invokeUrl+"/folder/"+selectedFolderId+"?user_id="+location.state.userId)
    .then(res => {
      console.log(res)
    }).catch(error=> {
      console.log(error)
    })

    const newFolders = folders;
    delete newFolders[selectedFolderId];
    setSelectedFolderId(null);
    setShowBookmarkButtons([false, false, false ,false, true]);
    setShowFolderButtons([true, false, false]);      

    setFolders(newFolders);
    
  }

  const deleteBookmark = () => {
    Axios.delete(invokeUrl+"/bookmark/"+selectedBookmarkId+"?folder_id="+selectedFolderId+"&user_id="+location.state.userId)
    .then(res => {
      console.log(res);
      let tempFolders = folders
      delete tempFolders[selectedFolderId]["bookmarks"][selectedBookmarkId]
      setSelectedBookmarkId(null);

      if(selectedFolderId === "root") {
          setShowBookmarkButtons([false, false, false ,false, true]);
      }
      else {
          setShowBookmarkButtons([true, false, false ,false, true]);
      }

      setFolders(tempFolders);   
    }).catch(error=> {
      console.log(error);
    })
  }

  // Functions required for editing folders and bookmarks
  const updateName = (e) => {
    setNewName(e.target.value);
  }

  const updateLink = (e) => {
    setNewLink(e.target.value);
  }

  const renameFolder = () => {
    if(newName.startsWith(" ")){
      window.alert("Invalid folder name.")
    }    
    else{
      Axios.put(invokeUrl+"/folder?folder_name="+newName+"&folder_id="+selectedFolderId+"&user_id="+location.state.userId)
      .then(res => {
        
      }).catch(error=> {
        console.log(error)
      })
      folders[selectedFolderId]["name"] = newName;
      setFolders(folders);
      setShowRenameFolderModal(!showRenameFolderModal);
    }
    
  }

  const editBookmark = () => {
    if(newName.startsWith(" ")){
      window.alert("Invalid folder name.")
    }
    else if(!urlCheck.test(newLink)) {
      window.alert("Invalid url");
    }
    else {
      Axios.put(invokeUrl+"/bookmark?folder_id="+selectedFolderId+"&bookmark_id="+selectedBookmarkId+"&bookmark_name="+newName+"&url="+newLink+"&user_id="+location.state.userId)
      .then(res => {
        console.log(res)
      }).catch(error=> {
        console.log(error)
      })
      let tempFolders = folders;
      tempFolders[selectedFolderId]["bookmarks"][selectedBookmarkId]["name"] = newName;
      tempFolders[selectedFolderId]["bookmarks"][selectedBookmarkId]["url"] = newLink;
      
      setFolders(folders);
      
      setShowEditBookmarkModal(!showEditBookmarkModal);
    }
    
  }

  const renameFolderModal = () => (  
    <Modal show={showRenameFolderModal} onHide={() => setShowRenameFolderModal(false)}>
        <Modal.Header style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <Modal.Title>Rename folder</Modal.Title>
        </Modal.Header>
        <Modal.Body style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <TextField id="outlined-basic" 
                        label="Enter new name:" 
                        variant="outlined"
                        // value = {selectedFolderId !== null ? folders[selectedFolderId]["name"]: null} 
                        onChange = {updateName}/>
        </Modal.Body>
        <Modal.Footer style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <Button color = "primary" variant= "outlined" className = {classes.modalButton} onClick = {renameFolder}>Ok</Button>
            <Button color = "secondary" variant= "outlined" className = {classes.modalButton} onClick = {() => setShowRenameFolderModal(false)}>Cancel</Button>
        </Modal.Footer>
    </Modal>
  )
  
  const editBookmarkModal = () => (
    <Modal show={showEditBookmarkModal} onHide={() => setShowEditBookmarkModal(false)}>
        <Modal.Header style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <Modal.Title>Edit bookmark</Modal.Title>
        </Modal.Header>
        <Modal.Body style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <TextField id="outlined-basic" 
                        label="Enter new name:" 
                        variant="outlined"
                        // value = {selectedBookmarkId !== null ? folders[selectedFolderId]["bookmarks"][selectedBookmarkId]["name"] : null}  
                        onChange = {updateName}/>
                        <br/> <br/>
            <TextField id="outlined-basic" 
                        label="Enter new link url:" 
                        variant="outlined"
                        // value = {selectedBookmarkId !== null ? folders[selectedFolderId]["bookmarks"][selectedBookmarkId]["url"]: null}  
                        onChange = {updateLink}/>
        </Modal.Body>
        <Modal.Footer style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <Button color = "primary" variant= "outlined" className = {classes.modalButton} onClick = {editBookmark}>Ok</Button>
            <Button color = "secondary" variant= "outlined" className = {classes.modalButton} onClick = {() => setShowEditBookmarkModal(false)}>Cancel</Button>
        </Modal.Footer>
    </Modal>
  )

  // Function required for moving bookmarks
  const moveBookmark = () => {
        
    Axios.post(invokeUrl+"/bookmark?folder_id="+selectedRenameFolderId+"&bookmark_name="+clipboard["name"]+"&url="+clipboard["url"]+"&user_id="+location.state.userId)
    .then(res => {
      let tempFolders = folders;
      tempFolders[selectedRenameFolderId]["bookmarks"][res] = clipboard;
      setFolders(tempFolders);    
    }).catch(error=> {
      console.log(error)
    })
    console.log(selectedBookmarkId);
    Axios.delete(invokeUrl+"/bookmark/"+selectedBookmarkId+"?folder_id="+selectedFolderId+"&user_id="+location.state.userId)
    .then(res => {
      let tempFolders = folders;
      delete tempFolders[selectedFolderId]["bookmarks"][selectedBookmarkId];
      setFolders(tempFolders);
      console.log(res);
      setShowMoveBookmarkModal(false);
      setSelectedBookmarkId(null);
    }).catch(error=> {
      console.log(error);
    })
    
  }
 
const copyAndShowMoveBookmarkModal = () => {
  setClipboard(folders[selectedFolderId]["bookmarks"][selectedBookmarkId]);
  setShowMoveBookmarkModal(true);
}

  const moveBookmarkModal = () => (
    <Modal show={showMoveBookmarkModal} onHide={() => setShowMoveBookmarkModal(false)}>
    <Modal.Header style = {{display: 'inline-block',
                            textAlign: 'center'}}>
        <Modal.Title>Move bookmark to</Modal.Title>
    </Modal.Header>
    <Modal.Body style = {{display: 'inline-block',
                            textAlign: 'center', height: '25vh', overflow: 'auto'}}>
        <List
            component="nav"
            aria-labelledby="nested-list-subheader"
            className={classes.root}
        >
            {Object.keys(folders).map((folderKey) => {
                if(folderKey !== "root" && selectedFolderId !== folderKey) {
                    return(
                        <ListItem button className={classes.nested}
                                selected = {selectedRenameFolderId === folderKey} 
                                onClick = {(e) => setSelectedRenameFolderId(folderKey)}>
                            <ListItemIcon>
                            <FolderIcon />
                            </ListItemIcon>
                            <ListItemText primary= {folders[folderKey]["name"]} />
                        </ListItem>
                    )
                }
                return(null);
            })}
        </List>
        </Modal.Body>
        <Modal.Footer style = {{display: 'inline-block',
                                textAlign: 'center'}}>
            <Button color = "primary" variant= "outlined" className = {classes.modalButton} onClick = {moveBookmark}>Ok</Button>
            <Button color = "secondary" variant= "outlined" className = {classes.modalButton} onClick = {() => setShowMoveBookmarkModal(false)}>Cancel</Button>
        </Modal.Footer>
    </Modal>
  )


  //Rendering functions for the folders and bookmarks
  const renderFolders = () => {
    
    return(Object.keys(folders).map((folderKey) => {
      if(folderKey !== "root") {
          return(<List
                component="nav"
                aria-labelledby="nested-list-subheader"
                className={classes.root}
              >
                <ListItem button selected={selectedFolderId === folderKey} 
                                  onClick={(e) => handleFolderClick(e, folderKey, null)}>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <ListItemText primary={folders[folderKey]["name"]} />
                    {folders[folderKey]["open"] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>

              <Collapse in={folders[folderKey]["open"]} timeout="auto" unmountOnExit>
                {renderBookmarks(folderKey)}       
              </Collapse>
              </List>);
      } 
    }))
  }
  
  const renderRootBookmarks = () => {
    return(<List
      component="nav"
      aria-labelledby="nested-list-subheader"
      className={classes.root}
    >
      {
        Object.keys(folders["root"]["bookmarks"]).map((bookmarkKey) => (
        
          <ListItem button className={classes.nestedroot} 
                  selected = {selectedBookmarkId === bookmarkKey} 
                  onClick = {(e) => handleBookmarkClick(e, bookmarkKey, "root")}>
              <ListItemIcon>
              <LinkIcon />
              </ListItemIcon>
              <ListItemText primary= {folders["root"]["bookmarks"][bookmarkKey]["name"]} 
                            secondary = {folders["root"]["bookmarks"][bookmarkKey]["url"]}
                            onDoubleClick = {() => navigateToBookmark(folders["root"]["bookmarks"][bookmarkKey]["url"])}
                            />
          </ListItem>))}
    </List>)
  }

  const renderBookmarks = (folderKey) => (    
    <List component="div" disablePadding>
      {Object.keys(folders[folderKey]["bookmarks"]).map((bookmarkKey) => 
              <ListItem button className={classes.nested} 
                        selected = {selectedBookmarkId === bookmarkKey} 
                        onClick = {(e) => handleBookmarkClick(e, bookmarkKey, folderKey)}>
                <ListItemIcon>
                  <LinkIcon />
                </ListItemIcon>
                <ListItemText primary= {folders[folderKey]["bookmarks"][bookmarkKey]["name"]} 
                              secondary = {folders[folderKey]["bookmarks"][bookmarkKey]["url"]}
                              onDoubleClick = {() => navigateToBookmark(folders[folderKey]["bookmarks"][bookmarkKey]["url"])}
                              />
              </ListItem>
      )}
    </List>
  );

  // Main render function call
  return (
    <div>
        <h1 className= {classes.title}>Bookmarks</h1>
        <div className={classes.mainDiv}>
            <div className = {classes.foldersDiv}>
                {renderFolders()}
                {renderRootBookmarks()}
            </div>
            <br/>
            {/* Buttons to manipulate bookmarks and folders (will show and hide according to the variables) */}
            <div className={classes.actionsDiv}>
                <Button color = "primary" className = {classes.actionButton} variant= "outlined" onClick = {() => setShowCreateFolderModal(true)}>Create folder</Button>
                {showBookmarkButtons[4] ? <Button color = "primary" className = {classes.actionButton} variant= "outlined" onClick = {() => {setShowCreateBookmarkModal(true); setCreateOrAddFlag(0)}}>Create bookmark</Button> : null}
                {showBookmarkButtons[0] ? <Button color = "primary" className = {classes.actionButton} variant= "outlined" onClick = {() => {setShowCreateBookmarkModal(true); setCreateOrAddFlag(1)}}>Add bookmark to folder</Button> : null}
                <br/>
                {showFolderButtons[2] ? <Button color = "primary" className = {classes.actionButton} variant= "outlined" onClick = {() => setShowRenameFolderModal(true)}>Rename folder</Button> : null}
                {showBookmarkButtons[2] ? <Button color = "primary" className = {classes.actionButton} variant= "outlined" onClick = {() => setShowEditBookmarkModal(true)}>Edit bookmark</Button> : null}
                <br/>
                {showBookmarkButtons[3] ? <Button color = "primary" className = {classes.actionButton} variant= "outlined" onClick = {() => copyAndShowMoveBookmarkModal()}>Move bookmark</Button> : null}
                <br/>
                {showFolderButtons[1] ? <Button color = "secondary" className = {classes.actionButton} variant= "outlined" onClick = {() => deleteFolder()}>Delete folder</Button> : null}
                {showBookmarkButtons[1] ? <Button color = "secondary" className = {classes.actionButton} variant= "outlined" onClick = {() => deleteBookmark()}>Delete bookmark</Button> : null}
            </div>

            {createFolderModal()}
            {createBookmarkModal()}
            {renameFolderModal()}
            {editBookmarkModal()}
            {moveBookmarkModal()}
        </div>
        <h5 className ={classes.userName}>User: {location.state.userName}</h5>
        <Button color = "primary" variant= "contained" className = {classes.logoutButton} onClick = {() => logout()}>Logout</Button>
    </div>
  );
}


//CSS for all the components
const useStyles = makeStyles((theme) => ({
  mainDiv: {
      position: 'absolute', left: '50%', top: '60%',
      transform: 'translate(-50%, -50%)',
      // border: '1px solid black',
      // borderRadius: '10px',
      height: '95vh',
      width: '95vw',
      display: 'inline-block',
      textAlign: 'center',
  },
  title: {
      textAlign: 'center',
      marginTop: '1vh'
  },
  foldersDiv: {
      height: "50vh",
      width: "50vw",
      overflow: 'auto',
      display: 'inline-block',
      textAlign: 'center',
      border: '1px solid black',
      borderRadius: '10px'
  },
  actionsDiv: {
      display: 'inline-block',
      textAlign: 'center',
  },
  root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
  },
  nested: {
      paddingLeft: theme.spacing(4),
  },
  nestedroot: {
    paddingLeft: theme.spacing(4),
    color: "blue",
},
  modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
  },
  moveBookmarkModal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
  },
  paper: {
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      borderRadius: "5px",
      height: "200px",
      width: "250px",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
  },
  modalButton: {
      margin: "2vh",
  },
  actionButton: {
      margin: '10px',
      position: 'relative',
  },
  userName: {
      position: 'absolute',
      left: '1vw',
      top: '1vh',
  },
  logoutButton: {
      position: 'absolute',
      right: '1vw',
      top: '1vh',
  }
}));

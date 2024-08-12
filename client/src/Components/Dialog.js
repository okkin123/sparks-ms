import React from 'react';
import { Modal, Box, Backdrop } from '@mui/material';


const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    boxShadow: 15,
    p: 2,
};

export default function Dialog(props){
    return(
        <Modal
        open={props.open}
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
        >
            <Box sx={style}>
                { props.content }
            </Box>
        </Modal>
    )
}
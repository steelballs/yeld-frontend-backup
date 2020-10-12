import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { TextField, Button, Typography, Modal, Box } from "@material-ui/core";

import { withNamespaces } from "react-i18next";
import { colors } from "../../theme";

import { GET_BALANCES_LIGHT } from "../../constants";

import UnlockModal from "../unlock/unlockModal.jsx";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "1200px",
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: "30px",
    marginBottom: "30px",
    [theme.breakpoints.up("md")]: {
      minWidth: "1000px",
    },
  },
  separatorStakeContainer: {
    width: "100%",
    display: "flex",
    borderBottom: "1px solid #e1e3e6",
    paddingBottom: "30px",
    borderTop: "none",
    alignItems: "center",
    justifyContent: "center",
    background: colors.white,
    [theme.breakpoints.down("sm")]: {
      justifyContent: "space-between",
      padding: "16px 24px",
    },
  },
  stakeContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    minWidth: "100%",
    [theme.breakpoints.up("md")]: {
      minWidth: "1000px",
    },
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
  },
  titleStake: {
    margin: "15px 0 15px",
  },
  stakeOptions: {
    display: "flex",
    maxWidth: "100%",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
    },
  },
  icon: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    cursor: "pointer",
  },
  links: {
    display: "flex",
  },
  link: {
    padding: "12px 0px",
    margin: "0px 12px",
    cursor: "pointer",
    "&:hover": {
      paddingBottom: "9px",
      borderBottom: "3px solid " + colors.borderBlue,
    },
  },
  title: {
    textTransform: "capitalize",
  },
  actionInput: {
    padding: "0px 0px 12px 0px",
    fontSize: "0.5rem",
  },
  linkActive: {
    padding: "12px 0px",
    margin: "0px 12px",
    cursor: "pointer",
    paddingBottom: "9px",
    borderBottom: "3px solid " + colors.borderBlue,
  },
  account: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    [theme.breakpoints.down("sm")]: {
      flex: "0",
    },
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    position: "absolute",
    width: 450,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  twoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridColumnGap: "0",
    [theme.breakpoints.up("lg")]: {
      gridTemplateColumns: "repeat(2, 1fr)",
      gridColumnGap: "24px",
    },
    [theme.breakpoints.up("xl")]: {
      gridTemplateColumns: "repeat(4, 2fr)",
      gridColumnGap: "24px",
    },
  },
  iconStake: {
    display: "flex",
    justifyContent: "center",
    alignItems: "left",
    [theme.breakpoints.down("sm")]: {
      margin: "20px 0 20px",
      alignItems: "center",
    },
  },
  boxUnstake: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid rgba(47, 99, 165, .12)",
    marginBottom: "12px",
    marginRight: "12px",
    minWidth: "200px",
    [theme.breakpoints.down("sm")]: {
      margin: "0 100px  0 100px",
    },
  },
  BoxUnstakeLast: {
    display: "flex",
  },
  boxRetirement: {
    minWidth: "400px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid rgba(47, 99, 165, .12)",
    marginBottom: "12px",
    marginRight: "12px",
  },
  boxRetirementYeldAvailable: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid rgba(47, 99, 165, .12)",
    marginBottom: "12px",
    marginRight: "12px",
    [theme.breakpoints.down("sm")]: {
      marginTop: "12px",
    },
  },
});

class StakeSimple extends Component {
  constructor(props) {
    super();

    const account = store.getStore("account");
    this.state = {
      account: account,
      modalOpen: false,
      retirementYeldAvailable: false, // When you have something to redeem
      earnings: 0,
      yeldBalance: 0,
      hoursPassedAfterStaking: 0,
      retirementYeldCurrentStaked: 0,
      stakeModalOpen: false,
      unstakeModalOpen: false,
      stakeAmount: 0,
      unStakeAmount: 0,
    };

    this.waitUntilSetupComplete();

    if (account && account.address) {
      dispatcher.dispatch({ type: GET_BALANCES_LIGHT, content: {} });
    }
  }

  secondsToHms(seconds) {
    if (!seconds) return "";

    let duration = seconds;
    let hours = duration / 3600;
    duration = duration % 3600;

    let min = parseInt(duration / 60);
    duration = duration % 60;

    let sec = parseInt(duration);

    if (sec < 10) {
      sec = `0${sec}`;
    }
    if (min < 10) {
      min = `0${min}`;
    }

    if (parseInt(hours, 10) > 0) {
      return `${parseInt(hours, 10)}h ${min}m ${sec}s`;
    } else if (min === 0) {
      return `${sec}s`;
    } else {
      return `${min}m ${sec}s`;
    }
  }

  async setupContractData() {
    const snapshot = await window.retirementYeld.methods
      .stakes(window.web3.eth.defaultAccount)
      .call();

    const dateNowWithOneDay =
      Number(Date.now().toString().substr(0, 10)) + 86400;
    const dateNow = Number(Date.now().toString().substr(0, 10));
    const substraction = Number(dateNow) - Number(snapshot.timestamp);
    const hoursPassedAfterStaking = this.secondsToHms(substraction);

    this.setState({
      retirementYeldCurrentStaked: snapshot.yeldBalance,
      hoursPassedAfterStaking:
        snapshot.timestamp === 0 ? 0 : hoursPassedAfterStaking,
    });

    // If one day has passed, change
    if (snapshot.timestamp !== 0 && dateNowWithOneDay >= snapshot.timestamp) {
      const balanceBlackHole = String(
        await window.yeld.methods
          .balanceOf("0x0000000000000000000000000000000000000000")
          .call()
      );
      const totalSupply = await window.yeld.methods.totalSupply().call();
      const userPercentage =
        snapshot.yeldBalance / (totalSupply - balanceBlackHole);

      // Gets how many ETH the user earns based on his balance
      const balanceRetirementContract = await window.web3.eth.getBalance(
        window.retirementYeld._address
      );
      const earnings = String(
        (balanceRetirementContract * userPercentage) / 100
      );
      if (earnings > 0)
        this.setState({ retirementYeldAvailable: true, earnings });
    }

    let yeldBalance = String(
      window.web3.utils.fromWei(
        await window.yeld.methods
          .balanceOf(window.web3.eth.defaultAccount)
          .call()
      )
    );
    if (yeldBalance.split(".").length > 1) {
      yeldBalance =
        yeldBalance.split(".")[0] +
        "." +
        yeldBalance.split(".")[1].substr(0, 2);
    }
    this.setState({ yeldBalance });
  }

  waitUntilSetupComplete() {
    window.myInterval = setInterval(async () => {
      if (this.props.setupComplete) {
        window.clearInterval(window.myInterval);
        await this.setupContractData();
      }
    }, 1e2);
  }

  render() {
    const { classes } = this.props;

    const { account, modalOpen } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.twoColumns}>
          <div className={classes.iconStake}>
            <img
              alt="Yeld Pension"
              src={require("../../assets/Exclusion-1.svg")}
              height={"65px"}
            />
          </div>
          <div className={classes.stakeContainer}>
            <Typography
              variant={"h3"}
              className={classes.titleStake}
              style={{ textAlign: "left" }}
            >
              Your Retirement Stake
            </Typography>
            <div className={classes.stakeOptions}>
              <Box className={classes.boxRetirementYeldAvailable}>
                <Button
                  disabled={!this.state.retirementYeldAvailable}
                  onClick={async () => {
                    if (await this.betaTesting()) {
                      await window.retirementYeld.methods.redeemETH().send({
                        from: window.web3.eth.defaultAccount,
                      });
                    } else {
                      alert(
                        "You can't use the dapp during the beta testing period if you hold less than 5 YELD"
                      );
                    }
                  }}
                >
                  <Typography
                    variant={"h5"}
                    color="secondary"
                    style={{ color: "#000000" }}
                  >
                    {!this.state.retirementYeldAvailable ? (
                      <span>
                        Retirement Yield Available in 24h
                        <br />
                        <i>
                          {this.state.hoursPassedAfterStaking <= 0
                            ? ""
                            : `Time passed ${this.state.hoursPassedAfterStaking}`}
                        </i>
                      </span>
                    ) : (
                      <span>
                        Redeem Retirement Yield ({this.state.earnings} ETH)
                      </span>
                    )}
                  </Typography>
                </Button>
              </Box>
              <Box
                color="text.secundary"
                className={classes.boxBalance}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid rgba(47, 99, 165, .12)",
                  marginBottom: "12px",
                  marginRight: "12px",
                }}
              >
                <Button
                  color="primary"
                  disabled={this.state.yeldBalance <= 0}
                  onClick={() => this.setState({ stakeModalOpen: true })}
                >
                  <Typography variant={"h5"} color="secondary">
                    Stake Your Yeld Tokens: {this.state.yeldBalance} YELD
                    <br />
                    <i>
                      {this.state.retirementYeldCurrentStaked <= 0
                        ? ""
                        : `Your Currently Staked Yeld Tokens: ${window.web3.utils.fromWei(
                            this.state.retirementYeldCurrentStaked
                          )} `}
                    </i>
                  </Typography>
                </Button>
              </Box>

              <Modal
                className={classes.modal}
                open={this.state.stakeModalOpen}
                onClose={() => this.setState({ stakeModalOpen: false })}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
              >
                <div style={this.modalStyle} className={classes.paper}>
                  <Typography variant="h4" className={classes.title}>
                    Enter how much YELD you want to stake. Warning: leave at
                    least 5 YELD in your wallet to keep using the beta!"
                  </Typography>
                  <br />
                  <TextField
                    fullWidth
                    className={classes.actionInput}
                    value={this.state.stakeAmount}
                    onChange={(e) =>
                      this.setState({ stakeAmount: e.target.value })
                    }
                    placeholder="0"
                    variant="outlined"
                  />
                  <br /> <br />
                  <div>
                    <Button
                      className={classes.BoxUnstakeLast}
                      variant="outlined"
                      color="primary"
                      disabled={this.state.stakeAmount <= 0}
                      onClick={async () => {
                        if (await this.betaTesting()) {
                          await window.yeld.methods
                            .approve(
                              window.retirementYeld._address,
                              window.web3.utils.toWei(
                                String(this.state.stakeAmount)
                              )
                            )
                            .send({
                              from: window.web3.eth.defaultAccount,
                            });

                          await window.retirementYeld.methods
                            .stakeYeld(
                              window.web3.utils.toWei(
                                String(this.state.stakeAmount)
                              )
                            )
                            .send({
                              from: window.web3.eth.defaultAccount,
                            });
                        } else {
                          alert(
                            "You can't use the dapp during the beta testing period if you hold less than 5 YELD"
                          );
                        }
                      }}
                    >
                      <Typography variant={"h5"} color="secondary">
                        Stake
                      </Typography>
                    </Button>

                    <Button
                      style={{ marginLeft: "50%" }}
                      variant="outlined"
                      color="primary"
                      onClick={() => this.setState({ stakeModalOpen: false })}
                    >
                      <Typography variant={"h5"} color="secondary">
                        Cancel
                      </Typography>
                    </Button>
                  </div>
                </div>
              </Modal>

              <Box color="text.secundary" className={classes.boxUnstake}>
                <Button
                  color="primary"
                  disabled={this.state.retirementYeldCurrentStaked <= 0}
                  onClick={() => this.setState({ unstakeModalOpen: true })}
                >
                  <Typography variant={"h5"} color="secondary">
                    Unstake Wallet
                  </Typography>
                </Button>

                <Modal
                  className={classes.modal}
                  open={this.state.unstakeModalOpen}
                  onClose={() => this.setState({ unstakeModalOpen: false })}
                  aria-labelledby="simple-modal-title"
                  aria-describedby="simple-modal-description"
                >
                  <div style={this.modalStyle} className={classes.paper}>
                    <Typography variant="h4" className={classes.title}>
                      Enter how much YELD you want to unstake:
                    </Typography>
                    <br />
                    <TextField
                      fullWidth
                      className={classes.actionInput}
                      value={this.state.unStakeAmount}
                      onChange={(e) =>
                        this.setState({ unStakeAmount: e.target.value })
                      }
                      placeholder="0"
                      variant="outlined"
                    />
                    <br /> <br />
                    <div>
                      <Button
                        variant="outlined"
                        color="primary"
                        style={{ display: "flex", order: "3" }}
                        disabled={this.state.unStakeAmount <= 0}
                        onClick={async () => {
                          await window.retirementYeld.methods
                            .unstake(
                              window.web3.utils.toWei(
                                String(this.state.unStakeAmount)
                              )
                            )
                            .send({
                              from: window.web3.eth.defaultAccount,
                            });
                        }}
                      >
                        <Typography variant={"h5"} color="secondary">
                          Unstake
                        </Typography>
                      </Button>

                      <Button
                        style={{ marginLeft: "46%" }}
                        color="primary"
                        onClick={() =>
                          this.setState({ unstakeModalOpen: false })
                        }
                      >
                        <Typography variant={"h5"} color="secondary">
                          Cancel
                        </Typography>
                      </Button>
                    </div>
                  </div>
                </Modal>
              </Box>
            </div>
          </div>
        </div>
      
      </div>
    );
  }

  getModalStyle = () => {
    const top = 50 + Math.round(Math.random() * 20) - 10;
    const left = 50 + Math.round(Math.random() * 20) - 10;
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  };

  addressClicked = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  renderModal = () => {
    return (
      <UnlockModal
        closeModal={this.closeModal}
        modalOpen={this.state.modalOpen}
      />
    );
  };
}

export default withNamespaces()(withRouter(withStyles(styles)(StakeSimple)));

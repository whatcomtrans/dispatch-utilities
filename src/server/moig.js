import oigServer from "moig-node";
import logger from "./logger.js";
import {
  session as sessionConfig,
  callControl as callControlConfig,
} from "./config.json";

let WTAphonePrefix = "3607889";
let dialOutPrefix = "8";
let oigSessionClient;
let oigCallControlClient;

export async function setupMoig() {
  oigSessionClient = oigServer.sessionClient(sessionConfig);
  oigCallControlClient = oigServer.callControlClient(callControlConfig);

  try {
    await oigSessionClient.connect();
    await oigSessionClient.loginEx();
    await oigCallControlClient.connect({
      sessionId: oigSessionClient.sessionId,
    });
    await oigCallControlClient.getIcpId();
  } catch (error) {
    logger.error("Error setting up moig", { error });
  } finally {
    logger.info("Moig setup successful");
  }
}

export async function makeCall(number, primeDn) {
  if (!number || !primeDn) {
    logger.error("No number or dn provided");
    return;
  }

  try {
    const getPhoneNumberIdResponse = await oigCallControlClient.getPhoneNumberId(
      { primeDn }
    );
    const objectId = getPhoneNumberIdResponse.result.objectId;
    await oigCallControlClient.monitorObject({ objectId });
    logger.info(`Calling ${number} from ${primeDn}`);
    oigCallControlClient.makeCall({
      objectId,
      number: formatPhoneNumber(number),
    });
    await oigCallControlClient.stopMonitor({ objectId });
  } catch (error) {
    logger.error("Error making call", error);
    return { error };
  }
}

function formatPhoneNumber(number) {
  if (number.startsWith(WTAphonePrefix)) {
    return number.substring(6);
  }

  return `${dialOutPrefix}${number}`;
}

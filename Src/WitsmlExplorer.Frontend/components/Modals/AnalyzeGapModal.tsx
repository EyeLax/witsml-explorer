import React, { useContext, useState } from "react";
import LogObject from "../../models/logObject";
import JobService, { JobType } from "../../services/jobService";
import { WITSML_INDEX_TYPE_DATE_TIME, WITSML_INDEX_TYPE_MD } from "../Constants";
import ModalDialog from "./ModalDialog";
import { TextField } from "@equinor/eds-core-react";
import OperationType from "../../contexts/operationType";
import { ReportModal } from "./ReportModal";
import OperationContext from "../../contexts/operationContext";

export interface AnalyzeGapModalProps {
  logObject: LogObject;
  mnemonics: string[];
}

const AnalyzeGapModal = (props: AnalyzeGapModalProps): React.ReactElement => {
  const { logObject, mnemonics } = props;
  const { dispatchOperation } = useContext(OperationContext);
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  const initialTime = "00:00:00";
  const [log] = useState<LogObject>(logObject);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gapSize, setGapSize] = useState<number>(0);
  const [timeGapSize, setTimeGapSize] = useState(initialTime);
  const [gapSizeIsValid, setGapSizeIsValid] = useState<boolean>(false);

  const onSubmit = async () => {
    setIsLoading(true);
    const analyzeGapsJob = {
      logReference: logObject,
      mnemonics: mnemonics,
      gapSize: gapSize,
      timeGapSize: convertToMilliseconds(timeGapSize)
    };
    const jobId = await JobService.orderJob(JobType.AnalyzeGaps, analyzeGapsJob);
    const reportModalProps = { jobId };
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
    dispatchOperation({ type: OperationType.DisplayModal, payload: <ReportModal {...reportModalProps} /> });
  };

  const handleGapSizeChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      const value = Number(event.target.value);
      setGapSize(value);
      setGapSizeIsValid(value > 0);
    }
  };

  const handleTimeGapSizeChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGapSizeIsValid(new RegExp(timePattern).test(event.target.value));
    if (event.target.value) {
      setTimeGapSize(event.target.value);
      const millisecondsTime = convertToMilliseconds(event.target.value);
      setGapSizeIsValid(millisecondsTime > 0);
    }
  };

  const convertToMilliseconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  };

  return (
    <>
      {log && (
        <ModalDialog
          heading={`Analyze gaps`}
          content={
            <>
              {log.indexType === WITSML_INDEX_TYPE_DATE_TIME && (
                <TextField
                  id={"timeGapSize"}
                  label="gap size"
                  value={timeGapSize}
                  onChange={handleTimeGapSizeChanged}
                  placeholder="hh:mm:ss"
                  maxLength={8}
                  helperText={
                    !gapSizeIsValid ? "Gap size time must be in format hh:mm:ss, where hours: 00..23, minutes: 00..59, seconds: 00..59 and must be greater then 00:00:00" : null
                  }
                />
              )}
              {log.indexType === WITSML_INDEX_TYPE_MD && (
                <TextField
                  id={"gapSize"}
                  label="gap size"
                  type="number"
                  value={gapSize}
                  onChange={handleGapSizeChanged}
                  helperText={!gapSizeIsValid ? "Gap size number must be greater than 0" : null}
                />
              )}
            </>
          }
          onSubmit={() => onSubmit()}
          isLoading={isLoading}
          confirmText={"Analyze"}
          confirmDisabled={!gapSizeIsValid}
        />
      )}
    </>
  );
};

export default AnalyzeGapModal;

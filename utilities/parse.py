import pandas as pd
import numpy as np



class LLPRecord:
	def __init__(self, pdSeries):

		self.id = str(int(pdSeries.at['Case ID']))
		self.date = pdSeries.at['Date']
		self.time = pdSeries.at['Time']
		self.deanery = pdSeries.at['Deanery']
		self.school = pdSeries.at['School']
		self.hospital = pdSeries.at['Hospital']

		self.reference = pdSeries.at['Personal Reference']
		self.age = pdSeries.at['Age']
		self.asa = pdSeries.at['ASA']
		
		self.dayCase = pdSeries.at['Day Case']
		self.priority = pdSeries.at['Priority']

		self.primarySpecialty = pdSeries.at['Primary Specialty']
		self.secondarySpecialty = pdSeries.at['Secondary Specialty (Optional)']
		self.operation = pdSeries.at['Operation']

		self.supervision = pdSeries.at['Supervision']
		self.supervisor = pdSeries.at['Supervisor']
		self.teaching = pdSeries.at['Teaching']

		self.regionalType = [pdSeries.at['Regional Type']]
		self.regionalTechnique = [pdSeries.at['Regional Technique']]
		self.regionalCatheter = [pdSeries.at['Regional Catheter']]
		self.regionalSupervision = [pdSeries.at['Regional Supervision']]
		self.regionalNotes = [pdSeries.at['Regional Notes']]

		self.procedureType = [pdSeries.at['Procedure Type']]
		self.procedureSupervision = [pdSeries.at['Procedure Supervision']]
		self.procedureSupervisor = [pdSeries.at['Procedure Supervisor']]
		self.procedureNotes = [pdSeries.at['Procedure Notes']]

		self.anaesthesiaMode = pdSeries.at['Mode of Anaesthesia']
	
		self.significantEvent = pdSeries.at['Significant Event']
		self.notes = pdSeries.at['Notes']

		return

	def appendAdditionalRowData(self, pdSeries):

		self.regionalType.append(pdSeries.at['Regional Type'])
		self.regionalTechnique.append(pdSeries.at['Regional Technique'])
		self.regionalCatheter.append(pdSeries.at['Regional Catheter'])
		self.regionalSupervision.append(pdSeries.at['Regional Supervision'])
		self.regionalNotes.append(pdSeries.at['Regional Notes'])

		self.procedureType.append(pdSeries.at['Procedure Type'])
		self.procedureSupervision.append(pdSeries.at['Procedure Supervision'])
		self.procedureSupervisor.append(pdSeries.at['Procedure Supervisor'])
		self.procedureNotes.append(pdSeries.at['Procedure Notes'])

		return

class LLPParser:
	def __init__(self, path):
		xl = pd.read_excel(io=path, sheet_name="LOGBOOK_CASE_ANAESTHETIC")
		numRows,numCols = xl.shape

		self.recordsList = []

		workingRow = None
		for i in range(numRows):
			if(not np.isnan(xl.iat[i,0])):
				if(not workingRow == None):
					self.recordsList.append(workingRow)
				workingRow = LLPRecord(xl.loc[i])
			else:
				workingRow.appendAdditionalRowData(xl.loc[i])
		self.recordsList.append(workingRow)

		return

	def getRecordByIndex(self,i):
		return self.recordsList[i]

	def getRecordByCaseId(self,caseId):
		output = None
		for r in self.recordsList:
			if(r.id == caseId):
				output = r
		return output



parser = LLPParser("./test_logbook.xlsx")
targetCase = parser.getRecordByCaseId("251")
print(targetCase)
print(targetCase.regionalType)










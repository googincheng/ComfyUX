from .PyComfyNode.ComfyUX import ComfyUX
import os
import server
from aiohttp import web
from .PyComfyNode.ComfyUXServer import ComfyUXServer

example = ComfyUX()
comfyUXServer = ComfyUXServer()

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
WEB_DIRECTORY = "./WebExtension"
DIR_PY = './PyComfyNode'

workspace_path = os.path.join(os.path.dirname(__file__))
dist_path = os.path.join(workspace_path, 'WebExtension')
if os.path.exists(dist_path):
    # load web static files (css, img,lib etc), 
    # get file from {http://{localhost:port}/static/{file local path}
    print(server.PromptServer.instance.app.router.add_static('/ComfyUXStatic/', path=dist_path,name='ComfyUXStatic'))
else:
    print(f"【ComfyUX】Error: Web directory not found: {dist_path}")


